use napi::{
    JsObject,
    bindgen_prelude::*,
    threadsafe_function::{ErrorStrategy, ThreadsafeFunction, ThreadsafeFunctionCallMode},
};
use std::thread;
use windows::{
    Devices::Enumeration::{DeviceInformation, DeviceWatcher},
    Foundation::TypedEventHandler,
    Media::Devices::MediaDevice,
    Win32::{
        Devices::FunctionDiscovery::PKEY_Device_FriendlyName,
        Media::Audio::{
            DEVICE_STATE, DEVICE_STATE_ACTIVE, DEVICE_STATE_DISABLED, DEVICE_STATE_UNPLUGGED,
            IMMDeviceEnumerator, MMDeviceEnumerator, eRender,
        },
        System::Com::{CLSCTX_ALL, CoCreateInstance, STGM_READ},
    },
};

const DEVICE_STATE_KNOWN: DEVICE_STATE = {
    let DEVICE_STATE(active) = DEVICE_STATE_ACTIVE;

    let DEVICE_STATE(disabled) = DEVICE_STATE_DISABLED;

    let DEVICE_STATE(unplugged) = DEVICE_STATE_UNPLUGGED;

    DEVICE_STATE(active | disabled | unplugged)
};

struct DeviceInfo {
    id: String,
    label: String,
}

#[napi(ts_return_type = "{ id: string, label: string }[]")]
pub fn request_device_list(
    env: Env,
    #[napi(ts_arg_type = "'all' | 'active'")] category: String,
) -> Array {
    match thread::spawn(move || {
        let mut device_vector = Vec::new();

        let mmdevice_enumerator: IMMDeviceEnumerator =
            unsafe { CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL) }.unwrap();

        let device_list = unsafe {
            mmdevice_enumerator.EnumAudioEndpoints(
                eRender,
                match category.as_str() {
                    "all" => DEVICE_STATE_KNOWN,
                    "active" => DEVICE_STATE_ACTIVE,
                    _ => DEVICE_STATE_KNOWN,
                },
            )
        }
        .unwrap();

        for index in 0..unsafe { device_list.GetCount() }.unwrap() {
            let device = unsafe { device_list.Item(index) }.unwrap();

            device_vector.push(DeviceInfo {
                id: {
                    let id = unsafe { device.GetId() }.unwrap();

                    let id = unsafe { id.to_string() }.unwrap();

                    let id_length = id.len();

                    if id_length >= 37 {
                        String::from(&id[id_length - 37..id_length - 1])
                    } else {
                        id
                    }
                },
                label: {
                    let property_store = unsafe { device.OpenPropertyStore(STGM_READ) }.unwrap();

                    let device_friendly_name =
                        unsafe { property_store.GetValue(&PKEY_Device_FriendlyName) }.unwrap();

                    unsafe {
                        device_friendly_name
                            .Anonymous
                            .Anonymous
                            .Anonymous
                            .pwszVal
                            .to_string()
                    }
                    .unwrap()
                },
            })
        }

        device_vector
    })
    .join()
    {
        Ok(device_vector) => Array::from_vec(
            &env,
            device_vector
                .into_iter()
                .map(|DeviceInfo { id, label }| {
                    let mut device_info = env.create_object().unwrap();

                    let _ = device_info.set("id", id);

                    let _ = device_info.set("label", label);

                    device_info
                })
                .collect::<Vec<JsObject>>(),
        )
        .unwrap(),
        Err(_) => env.create_array(0).unwrap(),
    }
}

#[napi]
pub struct DeviceManager {
    watcher: Option<DeviceWatcher>,
    background_event_token: (Option<i64>, Option<i64>, Option<i64>),
}

#[napi]
impl DeviceManager {
    fn open() -> Option<DeviceWatcher> {
        MediaDevice::GetAudioRenderSelector()
            .ok()
            .and_then(|audio_render_selector| {
                DeviceInformation::CreateWatcherAqsFilter(&audio_render_selector).ok()
            })
    }

    #[napi(
        constructor,
        ts_args_type = "active_action_handler: \
        (error: null | Error, result: 'change') => void"
    )]
    pub fn new(active_action_handler: JsFunction) -> Self {
        let watcher = Self::open();

        let active_action_handler: napi::Result<
            ThreadsafeFunction<String, ErrorStrategy::CalleeHandled>,
        > = active_action_handler.create_threadsafe_function(0, |ctx| {
            ctx.env
                .create_string_from_std(ctx.value)
                .map(|event_name| vec![event_name])
        });

        let background_event_token = watcher
            .as_ref()
            .and_then(|watcher| {
                active_action_handler.ok().map(|active_action_handler| {
                    let active_action_handler = (
                        active_action_handler.clone(),
                        active_action_handler.clone(),
                        active_action_handler,
                    );

                    (
                        watcher
                            .Added(&TypedEventHandler::new(move |_, _| {
                                active_action_handler.0.call(
                                    Ok(String::from("change")),
                                    ThreadsafeFunctionCallMode::Blocking,
                                );

                                Ok(())
                            }))
                            .ok(),
                        watcher
                            .Removed(&TypedEventHandler::new(move |_, _| {
                                active_action_handler.1.call(
                                    Ok(String::from("change")),
                                    ThreadsafeFunctionCallMode::Blocking,
                                );

                                Ok(())
                            }))
                            .ok(),
                        watcher
                            .Updated(&TypedEventHandler::new(move |_, _| {
                                active_action_handler.2.call(
                                    Ok(String::from("change")),
                                    ThreadsafeFunctionCallMode::Blocking,
                                );

                                Ok(())
                            }))
                            .ok(),
                    )
                })
            })
            .unwrap_or_default();

        Self {
            watcher,
            background_event_token,
        }
    }

    #[napi(getter)]
    pub fn is_open(&self) -> bool {
        self.watcher.is_some()
    }

    fn device_manager_not_open_error() -> Error {
        Error::new(Status::GenericFailure, "The device manager is not open")
    }

    #[napi(ts_return_type = "never | void")]
    pub fn enable(&self) -> napi::Result<()> {
        if self.is_open() {
            if let Some(watcher) = self.watcher.as_ref() {
                let _ = watcher.Start();
            }

            Ok(())
        } else {
            Err(Self::device_manager_not_open_error())
        }
    }

    #[napi]
    pub fn close(&mut self) {
        if self.is_open()
            && let Some(watcher) = self.watcher.take()
        {
            let _ = watcher.Stop();

            let Self {
                background_event_token:
                    (
                        background_event_token_for_added,
                        background_event_token_for_removed,
                        background_event_token_for_updated,
                    ),
                ..
            } = *self;

            if let Some(background_event_token_for_added) = background_event_token_for_added {
                let _ = watcher.RemoveAdded(background_event_token_for_added);
            }

            if let Some(background_event_token_for_removed) = background_event_token_for_removed {
                let _ = watcher.RemoveRemoved(background_event_token_for_removed);
            }

            if let Some(background_event_token_for_updated) = background_event_token_for_updated {
                let _ = watcher.RemoveUpdated(background_event_token_for_updated);
            }
        }
    }
}
