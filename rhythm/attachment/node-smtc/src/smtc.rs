use napi::{
    bindgen_prelude::*,
    threadsafe_function::{ErrorStrategy, ThreadsafeFunction, ThreadsafeFunctionCallMode},
};
use std::{
    sync::{Arc, mpsc},
    thread,
};
use windows::{
    Foundation::{TypedEventHandler, Uri},
    Media::{
        MediaPlaybackStatus, MediaPlaybackType, Playback::MediaPlayer,
        SystemMediaTransportControls, SystemMediaTransportControlsButton,
        SystemMediaTransportControlsButtonPressedEventArgs,
    },
    Storage::Streams::RandomAccessStreamReference,
    core::HSTRING,
};

enum PassiveAction {
    DisplayUpdater {
        title: String,
        artist: String,
        thumbnail: String,
    },
    PlaybackStatus {
        is_playing: bool,
    },
}

#[napi(js_name = "SMTC")]
pub struct Smtc {
    source_player: Option<MediaPlayer>,
    smtc: Option<Arc<SystemMediaTransportControls>>,
    background_event_token: Option<i64>,
    background_task_tx: Option<mpsc::Sender<PassiveAction>>,
    background_task_handle: Option<thread::JoinHandle<()>>,
}

#[napi]
impl Smtc {
    fn open() -> (
        Option<MediaPlayer>,
        Option<Arc<SystemMediaTransportControls>>,
    ) {
        let mut source_player = MediaPlayer::new().ok();

        let smtc = source_player
            .as_ref()
            .and_then(|source_player| source_player.SystemMediaTransportControls().ok())
            .map(Arc::new);

        if smtc.is_none() {
            source_player = None;
        } else if let Some(source_player) = source_player.as_ref()
            && let Ok(command_manager) = source_player.CommandManager()
        {
            let _ = command_manager.SetIsEnabled(false);
        }

        (source_player, smtc)
    }

    #[napi(
        constructor,
        ts_args_type = "active_action_handler: \
        (error: null | Error, result: '' | 'previous-track' | 'play' | 'pause' | 'next-track') => void"
    )]
    pub fn new(active_action_handler: JsFunction) -> Self {
        let (source_player, smtc) = Self::open();

        let active_action_handler: napi::Result<
            ThreadsafeFunction<String, ErrorStrategy::CalleeHandled>,
        > = active_action_handler.create_threadsafe_function(0, |ctx| {
            ctx.env
                .create_string_from_std(ctx.value)
                .map(|event_name| vec![event_name])
        });

        let background_event_token = smtc.as_ref().and_then(|smtc| {
            active_action_handler
                .ok()
                .and_then(|active_action_handler| {
                    smtc.ButtonPressed(&TypedEventHandler::<
                        SystemMediaTransportControls,
                        SystemMediaTransportControlsButtonPressedEventArgs,
                    >::new(move |_, event_args| {
                        if let Some(ref event_args) = *event_args
                            && let Ok(button) = event_args.Button()
                        {
                            active_action_handler.call(
                                Ok(match button {
                                    SystemMediaTransportControlsButton::Previous => {
                                        String::from("previous-track")
                                    }
                                    SystemMediaTransportControlsButton::Play => {
                                        String::from("play")
                                    }
                                    SystemMediaTransportControlsButton::Pause => {
                                        String::from("pause")
                                    }
                                    SystemMediaTransportControlsButton::Next => {
                                        String::from("next-track")
                                    }
                                    _ => String::from(""),
                                }),
                                ThreadsafeFunctionCallMode::Blocking,
                            );
                        }

                        Ok(())
                    }))
                    .ok()
                })
        });

        let (background_task_tx, background_task_rx) = smtc
            .as_ref()
            .map(|_| {
                let (tx, rx) = mpsc::channel();

                (Some(tx), Some(rx))
            })
            .unwrap_or_default();

        let background_task_handle = smtc.as_ref().map(|smtc| {
            let smtc = Arc::clone(smtc);

            thread::spawn(move || {
                if let Some(rx) = background_task_rx {
                    let mut latest_display_updater_action = None;

                    let mut latest_playback_status_action = None;

                    let update_latest_action = |passive_action: PassiveAction,
                                                latest_display_updater_action: &mut Option<
                        PassiveAction,
                    >,
                                                latest_playback_status_action: &mut Option<
                        PassiveAction,
                    >| {
                        match passive_action {
                            passive_action @ PassiveAction::DisplayUpdater { .. } => {
                                *latest_display_updater_action = Some(passive_action);
                            }
                            passive_action @ PassiveAction::PlaybackStatus { .. } => {
                                *latest_playback_status_action = Some(passive_action);
                            }
                        }
                    };

                    'entry: while let Ok(passive_action) = rx.recv() {
                        update_latest_action(
                            passive_action,
                            &mut latest_display_updater_action,
                            &mut latest_playback_status_action,
                        );

                        loop {
                            match rx.try_recv() {
                                Ok(passive_action) => update_latest_action(
                                    passive_action,
                                    &mut latest_display_updater_action,
                                    &mut latest_playback_status_action,
                                ),
                                Err(mpsc::TryRecvError::Empty) => break,
                                Err(mpsc::TryRecvError::Disconnected) => break 'entry,
                            }
                        }

                        if latest_display_updater_action.is_some()
                            && let PassiveAction::DisplayUpdater {
                                title,
                                artist,
                                thumbnail,
                            } = latest_display_updater_action.take().unwrap()
                            && let Ok(display_updater) = smtc.DisplayUpdater()
                        {
                            let _ = display_updater.SetType(MediaPlaybackType::Music);

                            if let Ok(music_properties) = display_updater.MusicProperties() {
                                let _ = music_properties.SetTitle(&HSTRING::from(title));

                                let _ = music_properties.SetArtist(&HSTRING::from(artist));
                            }

                            if let Ok(uri) = Uri::CreateUri(&HSTRING::from(thumbnail))
                                && let Ok(stream_reference) =
                                    RandomAccessStreamReference::CreateFromUri(&uri)
                            {
                                let _ = display_updater.SetThumbnail(&stream_reference);
                            }

                            let _ = display_updater.Update();
                        }

                        if latest_playback_status_action.is_some()
                            && let PassiveAction::PlaybackStatus { is_playing } =
                                latest_playback_status_action.take().unwrap()
                        {
                            let _ = smtc.SetPlaybackStatus(if is_playing {
                                MediaPlaybackStatus::Playing
                            } else {
                                MediaPlaybackStatus::Paused
                            });
                        }
                    }
                }
            })
        });

        Self {
            source_player,
            smtc,
            background_event_token,
            background_task_tx,
            background_task_handle,
        }
    }

    #[napi(getter)]
    pub fn is_open(&self) -> bool {
        self.smtc.is_some()
    }

    fn smtc_not_open_error() -> Error {
        Error::new(Status::GenericFailure, "The SMTC service is not open")
    }

    #[napi(ts_return_type = "never | void")]
    pub fn enable(&self) -> napi::Result<()> {
        if self.is_open() {
            if let Some(smtc) = self.smtc.as_ref() {
                let _ = smtc.SetIsPreviousEnabled(true);

                let _ = smtc.SetIsPlayEnabled(true);

                let _ = smtc.SetIsPauseEnabled(true);

                let _ = smtc.SetIsNextEnabled(true);

                let _ = smtc.SetIsEnabled(true);
            }

            Ok(())
        } else {
            Err(Self::smtc_not_open_error())
        }
    }

    #[napi(ts_return_type = "never | void")]
    pub fn update_metadata(
        &self,
        title: String,
        artist: String,
        thumbnail: String,
    ) -> napi::Result<()> {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.as_ref() {
                let _ = background_task_tx.send(PassiveAction::DisplayUpdater {
                    title,
                    artist,
                    thumbnail,
                });
            }

            Ok(())
        } else {
            Err(Self::smtc_not_open_error())
        }
    }

    #[napi(ts_return_type = "never | void")]
    pub fn update_playback_state(&self, is_playing: bool) -> napi::Result<()> {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.as_ref() {
                let _ = background_task_tx.send(PassiveAction::PlaybackStatus { is_playing });
            }

            Ok(())
        } else {
            Err(Self::smtc_not_open_error())
        }
    }

    #[napi]
    pub fn close(&mut self) {
        if self.is_open() {
            self.background_task_tx = None;

            if let Some(background_task_handle) = self.background_task_handle.take() {
                let _ = background_task_handle.join();
            }

            if let Some(smtc) = self.smtc.take() {
                let _ = smtc.SetIsEnabled(false);

                if let Some(background_event_token) = self.background_event_token.take() {
                    let _ = smtc.RemoveButtonPressed(background_event_token);
                }
            }

            self.source_player = None;
        }
    }
}
