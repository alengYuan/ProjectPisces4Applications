use napi::{
    bindgen_prelude::*,
    threadsafe_function::{ErrorStrategy, ThreadsafeFunction, ThreadsafeFunctionCallMode},
};
use rubato::{
    Resampler, SincFixedIn, SincInterpolationParameters, SincInterpolationType, WindowFunction,
};
use std::{
    cmp::min,
    collections::{HashSet, VecDeque},
    fs::File,
    io::ErrorKind as IOErrorKind,
    ops::Deref,
    result::Result,
    slice,
    sync::mpsc,
    thread,
    time::Duration,
    vec::IntoIter,
};
use symphonia::{
    core::{
        audio::{AudioBuffer, AudioBufferRef, Signal},
        codecs::{CODEC_TYPE_NULL, Decoder},
        conv::{FromSample, IntoSample},
        errors::Error as SymphoniaError,
        formats::{FormatReader, SeekMode, SeekTo, SeekedTo, Track},
        io::MediaSourceStream,
        probe::{Hint, ProbeResult},
        sample::{Sample, SampleFormat, i24},
        units::Time,
    },
    default as Symphonia,
};
use windows::{
    Win32::{
        Foundation::{CloseHandle, HANDLE, PROPERTYKEY, WAIT_OBJECT_0},
        Media::{
            Audio::{
                AUDCLNT_SHAREMODE_SHARED, AUDCLNT_STREAMFLAGS_EVENTCALLBACK,
                AudioSessionDisconnectReason, AudioSessionState, DEVICE_STATE, DEVICE_STATE_ACTIVE,
                DisconnectReasonFormatChanged, EDataFlow, ERole, IAudioClient, IAudioClock,
                IAudioRenderClient, IAudioSessionControl, IAudioSessionEvents,
                IAudioSessionEvents_Impl, IMMDevice, IMMDeviceEnumerator, IMMNotificationClient,
                IMMNotificationClient_Impl, MMDeviceEnumerator, WAVE_FORMAT_PCM, WAVEFORMATEX,
                WAVEFORMATEXTENSIBLE, eMultimedia, eRender,
            },
            KernelStreaming::{KSDATAFORMAT_SUBTYPE_PCM, WAVE_FORMAT_EXTENSIBLE},
            Multimedia::{KSDATAFORMAT_SUBTYPE_IEEE_FLOAT, WAVE_FORMAT_IEEE_FLOAT},
        },
        System::{
            Com::{
                CLSCTX_ALL, COINIT_MULTITHREADED, CoCreateInstance, CoInitializeEx, CoTaskMemFree,
                CoUninitialize,
            },
            Threading::{
                AvRevertMmThreadCharacteristics, AvSetMmThreadCharacteristicsW, CreateEventW,
                ResetEvent, WaitForSingleObject,
            },
        },
    },
    core::{BOOL, GUID, PCWSTR, w},
};
use windows_core::implement;

mod standard {
    pub enum AudioEndpoint {
        Default,
        Custom(String),
    }

    pub struct Volume {
        _level_percent_base: f64,
        amplitude_percent_base: f32,
    }

    impl Volume {
        pub fn new(value: f64) -> Self {
            let level_percent_base = value.clamp(0_f64, 1_f64);

            let amplitude_percent_base = if level_percent_base < 0.001 {
                0_f32
            } else if level_percent_base > 0.999 {
                1_f32
            } else {
                let db_dynamic_range = 60_f64;

                10_f64.powf(((level_percent_base * db_dynamic_range) - db_dynamic_range) / 20_f64)
                    as f32
            };

            Self {
                _level_percent_base: level_percent_base,
                amplitude_percent_base,
            }
        }

        pub fn get(&self) -> f32 {
            self.amplitude_percent_base
        }
    }

    pub enum Command {
        SelectMode(AudioEndpoint, Volume),
        CorrectAudioEndpointDefault,
        CorrectDeviceFormat,
        ModifyVolume(Volume),
        SelectTrack(String, String),
        ClearTrack,
        Seek(u32),
        Play,
        Pause,
        Stop,
        Close,
    }

    pub enum DeviceException {
        FatalException,
        NoAvailableDefaultAudioEndpoint,
        UnavailableCustomAudioEndpoint,
        UnsupportedDeviceFormat,
        SilentException,
    }

    pub enum SourceException {
        InvalidFile,
        IncorrectFile,
    }
}

use standard::*;

mod com_impl {
    use super::*;

    #[implement(IMMNotificationClient)]
    pub struct MMNotificationClient {
        pub tx: mpsc::Sender<Command>,
    }

    impl IMMNotificationClient_Impl for MMNotificationClient_Impl {
        fn OnDefaultDeviceChanged(
            &self,
            flow: EDataFlow,
            role: ERole,
            _: &PCWSTR,
        ) -> windows::core::Result<()> {
            if flow == eRender && role == eMultimedia {
                let _ = self.tx.send(Command::CorrectAudioEndpointDefault);
            }

            Ok(())
        }

        fn OnDeviceAdded(&self, _: &PCWSTR) -> windows::core::Result<()> {
            Ok(())
        }

        fn OnDeviceRemoved(&self, _: &PCWSTR) -> windows::core::Result<()> {
            Ok(())
        }

        fn OnDeviceStateChanged(&self, _: &PCWSTR, _: DEVICE_STATE) -> windows::core::Result<()> {
            Ok(())
        }

        fn OnPropertyValueChanged(&self, _: &PCWSTR, _: &PROPERTYKEY) -> windows::core::Result<()> {
            Ok(())
        }
    }

    #[implement(IAudioSessionEvents)]
    pub struct AudioSessionEvents {
        pub tx: mpsc::Sender<Command>,
    }

    impl IAudioSessionEvents_Impl for AudioSessionEvents_Impl {
        fn OnChannelVolumeChanged(
            &self,
            _: u32,
            _: *const f32,
            _: u32,
            _: *const GUID,
        ) -> windows_core::Result<()> {
            Ok(())
        }

        fn OnDisplayNameChanged(&self, _: &PCWSTR, _: *const GUID) -> windows_core::Result<()> {
            Ok(())
        }

        fn OnGroupingParamChanged(
            &self,
            _: *const GUID,
            _: *const GUID,
        ) -> windows_core::Result<()> {
            Ok(())
        }

        fn OnIconPathChanged(&self, _: &PCWSTR, _: *const GUID) -> windows_core::Result<()> {
            Ok(())
        }

        fn OnSessionDisconnected(
            &self,
            disconnectreason: AudioSessionDisconnectReason,
        ) -> windows_core::Result<()> {
            if disconnectreason == DisconnectReasonFormatChanged {
                let _ = self.tx.send(Command::CorrectDeviceFormat);
            }

            Ok(())
        }

        fn OnSimpleVolumeChanged(
            &self,
            _: f32,
            _: BOOL,
            _: *const GUID,
        ) -> windows_core::Result<()> {
            Ok(())
        }

        fn OnStateChanged(&self, _: AudioSessionState) -> windows_core::Result<()> {
            Ok(())
        }
    }
}

use com_impl::*;

mod scheduler {
    use super::*;

    #[derive(PartialEq, Eq, Hash)]
    enum CoarseFilterTag {
        ModeIsSelected,
        AudioEndpointDefaultIsCorrected,
        DeviceFormatIsCorrected,
    }

    #[derive(PartialEq, Eq, Hash)]
    enum FilterTag {
        ModeIsSelected,
        AudioEndpointDefaultIsCorrected,
        VolumeIsModified,
        TrackIsUpdated,
        ProgressIsUpdated,
        StateIsChanged,
    }

    pub struct CommandScheduler {
        rx: mpsc::Receiver<Command>,
    }

    impl CommandScheduler {
        pub fn new(rx: mpsc::Receiver<Command>) -> Self {
            Self { rx }
        }

        pub fn backlog_into_iter(&self, wait: bool) -> impl Iterator<Item = Command> {
            let mut coarse_filter_tag_set = HashSet::new();

            let mut coarse_fill_vector = |command: Command,
                                          coarse_filtered_backlog_command_vector: &mut VecDeque<
                Command,
            >|
             -> bool {
                let finish = matches!(command, Command::Close);

                match command {
                    command @ Command::SelectMode(_, _) => {
                        coarse_filtered_backlog_command_vector.push_front(command);

                        coarse_filter_tag_set.insert(CoarseFilterTag::ModeIsSelected);
                    }
                    command @ Command::CorrectAudioEndpointDefault => {
                        if !(coarse_filter_tag_set.contains(&CoarseFilterTag::ModeIsSelected)
                            || coarse_filter_tag_set
                                .contains(&CoarseFilterTag::AudioEndpointDefaultIsCorrected))
                        {
                            coarse_filtered_backlog_command_vector.push_front(command);

                            coarse_filter_tag_set
                                .insert(CoarseFilterTag::AudioEndpointDefaultIsCorrected);
                        }
                    }
                    command @ Command::CorrectDeviceFormat => {
                        if !(coarse_filter_tag_set.contains(&CoarseFilterTag::ModeIsSelected)
                            || coarse_filter_tag_set
                                .contains(&CoarseFilterTag::AudioEndpointDefaultIsCorrected)
                            || coarse_filter_tag_set
                                .contains(&CoarseFilterTag::DeviceFormatIsCorrected))
                        {
                            coarse_filtered_backlog_command_vector.push_front(command);

                            coarse_filter_tag_set.insert(CoarseFilterTag::DeviceFormatIsCorrected);
                        }
                    }
                    command => {
                        coarse_filtered_backlog_command_vector.push_front(command);
                    }
                }

                finish
            };

            let mut coarse_filtered_backlog_command_vector = VecDeque::new();

            if wait {
                if let Ok(command) = self.rx.recv() {
                    coarse_fill_vector(command, &mut coarse_filtered_backlog_command_vector);
                } else {
                    coarse_filtered_backlog_command_vector.push_front(Command::Close);
                }
            }

            if let Some(command) = coarse_filtered_backlog_command_vector.back()
                && matches!(command, Command::Close)
            {
                return coarse_filtered_backlog_command_vector.into_iter();
            }

            loop {
                match self.rx.try_recv() {
                    Ok(command) => {
                        if coarse_fill_vector(command, &mut coarse_filtered_backlog_command_vector)
                        {
                            break;
                        }
                    }
                    Err(mpsc::TryRecvError::Empty) => break,
                    Err(mpsc::TryRecvError::Disconnected) => {
                        coarse_filtered_backlog_command_vector.push_front(Command::Close);

                        break;
                    }
                }
            }

            let mut filter_tag_set = HashSet::new();

            let mut fill_vector = |command: Command,
                                   filtered_backlog_command_vector: &mut VecDeque<Command>|
             -> bool {
                let finish = matches!(command, Command::Close);

                match command {
                    command @ Command::SelectMode(_, _) => {
                        if !filter_tag_set.contains(&FilterTag::ModeIsSelected) {
                            filtered_backlog_command_vector.push_front(command);

                            filter_tag_set.insert(FilterTag::ModeIsSelected);
                        }
                    }
                    command @ Command::CorrectAudioEndpointDefault => {
                        if !filter_tag_set.contains(&FilterTag::ModeIsSelected) {
                            filtered_backlog_command_vector.push_front(command);

                            filter_tag_set.insert(FilterTag::AudioEndpointDefaultIsCorrected);
                        }
                    }
                    command @ Command::CorrectDeviceFormat => {
                        if !(filter_tag_set.contains(&FilterTag::ModeIsSelected)
                            || filter_tag_set.contains(&FilterTag::AudioEndpointDefaultIsCorrected))
                        {
                            filtered_backlog_command_vector.push_front(command);
                        }
                    }
                    command @ Command::ModifyVolume(_) => {
                        if !(filter_tag_set.contains(&FilterTag::ModeIsSelected)
                            || filter_tag_set.contains(&FilterTag::VolumeIsModified))
                        {
                            filtered_backlog_command_vector.push_front(command);

                            filter_tag_set.insert(FilterTag::VolumeIsModified);
                        }
                    }
                    command @ (Command::SelectTrack(_, _) | Command::ClearTrack) => {
                        if !filter_tag_set.contains(&FilterTag::TrackIsUpdated) {
                            filtered_backlog_command_vector.push_front(command);

                            filter_tag_set.insert(FilterTag::TrackIsUpdated);
                        }
                    }
                    command @ Command::Seek(_) => {
                        if !filter_tag_set.contains(&FilterTag::ProgressIsUpdated) {
                            filtered_backlog_command_vector.push_front(command);

                            filter_tag_set.insert(FilterTag::ProgressIsUpdated);
                        }
                    }
                    command @ (Command::Play | Command::Pause) => {
                        if !filter_tag_set.contains(&FilterTag::StateIsChanged) {
                            filtered_backlog_command_vector.push_front(command);

                            filter_tag_set.insert(FilterTag::StateIsChanged);
                        }
                    }
                    command @ Command::Stop => {
                        if !(filter_tag_set.contains(&FilterTag::ProgressIsUpdated)
                            || filter_tag_set.contains(&FilterTag::StateIsChanged))
                        {
                            filtered_backlog_command_vector.push_front(command);

                            filter_tag_set.insert(FilterTag::ProgressIsUpdated);

                            filter_tag_set.insert(FilterTag::StateIsChanged);
                        } else {
                            if !filter_tag_set.contains(&FilterTag::ProgressIsUpdated) {
                                filtered_backlog_command_vector.push_front(Command::Seek(0));

                                filter_tag_set.insert(FilterTag::ProgressIsUpdated);
                            }

                            if !filter_tag_set.contains(&FilterTag::StateIsChanged) {
                                filtered_backlog_command_vector.push_front(Command::Pause);

                                filter_tag_set.insert(FilterTag::StateIsChanged);
                            }
                        }
                    }
                    command @ Command::Close => {
                        filtered_backlog_command_vector.push_front(command);
                    }
                }

                finish
            };

            let mut filtered_backlog_command_vector = VecDeque::new();

            for command in coarse_filtered_backlog_command_vector {
                if fill_vector(command, &mut filtered_backlog_command_vector) {
                    break;
                }
            }

            filtered_backlog_command_vector.into_iter()
        }
    }

    pub struct DeviceEnumerator<'a> {
        value: IMMDeviceEnumerator,
        notification_client: &'a IMMNotificationClient,
    }

    impl<'a> DeviceEnumerator<'a> {
        pub fn init(
            notification_client: &'a IMMNotificationClient,
        ) -> Result<Self, DeviceException> {
            unsafe { CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL) }
                .and_then(|device_enumerator: IMMDeviceEnumerator| {
                    unsafe {
                        device_enumerator.RegisterEndpointNotificationCallback(notification_client)
                    }
                    .map(|_| Self {
                        value: device_enumerator,
                        notification_client,
                    })
                })
                .map_err(|_| DeviceException::FatalException)
        }

        pub fn get(&self) -> &IMMDeviceEnumerator {
            &self.value
        }
    }

    impl<'a> Drop for DeviceEnumerator<'a> {
        fn drop(&mut self) {
            let _ = unsafe {
                self.value
                    .UnregisterEndpointNotificationCallback(self.notification_client)
            };
        }
    }

    mod device_scheduler {
        use super::*;

        pub struct CorrectableParts {
            audio_client: IAudioClient,
            mix_format_ptr: *const WAVEFORMATEX,
            expected_format: (SampleFormat, u32),
            buffer_frame_count: u32,
            audio_clock: IAudioClock,
            audio_render_client: IAudioRenderClient,
            audio_session_control: IAudioSessionControl,
        }

        impl TryFrom<(&IMMDevice, &HANDLE, &IAudioSessionEvents)> for CorrectableParts {
            type Error = DeviceException;

            fn try_from(
                (device, event_handle, audio_session_events): (
                    &IMMDevice,
                    &HANDLE,
                    &IAudioSessionEvents,
                ),
            ) -> Result<Self, Self::Error> {
                unsafe { device.Activate(CLSCTX_ALL, None) }
                    .map_err(|_| DeviceException::SilentException)
                    .and_then(|audio_client: IAudioClient| {
                        unsafe { audio_client.GetMixFormat() }
                            .map_err(|_| DeviceException::SilentException)
                            .and_then(|mix_format_ptr| {
                                let sample_rate = unsafe { *mix_format_ptr }.nSamplesPerSec;

                                (unsafe { *mix_format_ptr }.nChannels == 2 &&
                                    (44_100..=192_000).contains(&sample_rate))
                                    .then_some(sample_rate)
                                    .and_then(|sample_rate| {
                                        let mix_format_ref = &unsafe { *mix_format_ptr };

                                        match mix_format_ref.wFormatTag as u32 {
                                            WAVE_FORMAT_PCM => match mix_format_ref.wBitsPerSample {
                                                8 => Some((SampleFormat::S8, sample_rate)),
                                                16 => Some((SampleFormat::S16, sample_rate)),
                                                _ => None
                                            }
                                            WAVE_FORMAT_IEEE_FLOAT => match mix_format_ref.wBitsPerSample {
                                                32 => Some((SampleFormat::F32, sample_rate)),
                                                _ => None,
                                            }
                                            WAVE_FORMAT_EXTENSIBLE => {
                                                let mix_format_ref = &unsafe {
                                                    *(mix_format_ptr as *const _ as *const WAVEFORMATEXTENSIBLE)
                                                };

                                                match mix_format_ref.SubFormat {
                                                    KSDATAFORMAT_SUBTYPE_PCM => match mix_format_ref.Format.wBitsPerSample {
                                                        16 => Some((SampleFormat::S16, sample_rate)),
                                                        24 => Some((SampleFormat::S24, sample_rate)),
                                                        32 => Some((SampleFormat::S32, sample_rate)),
                                                        _ => None,
                                                    }
                                                    KSDATAFORMAT_SUBTYPE_IEEE_FLOAT => match mix_format_ref.Format.wBitsPerSample {
                                                        32 => Some((SampleFormat::F32, sample_rate)),
                                                        _ => None,
                                                    }
                                                    _ => None
                                                }
                                            }
                                            _ => None,
                                        }
                                    })
                                    .ok_or(DeviceException::UnsupportedDeviceFormat)
                                    .and_then(|expected_format| {
                                        unsafe {
                                            audio_client.Initialize(
                                                AUDCLNT_SHAREMODE_SHARED,
                                                AUDCLNT_STREAMFLAGS_EVENTCALLBACK,
                                                0,
                                                0,
                                                mix_format_ptr,
                                                None,
                                            )
                                        }
                                            .and_then(|_| {
                                                let _ = unsafe { ResetEvent(*event_handle) };

                                                unsafe { audio_client.SetEventHandle(*event_handle) }
                                            })
                                            .and_then(|_| unsafe { audio_client.GetBufferSize() })
                                            .and_then(|buffer_frame_count| {
                                                unsafe { audio_client.GetService() }
                                                    .and_then(|audio_clock: IAudioClock| {
                                                        unsafe { audio_client.GetService() }
                                                            .and_then(|audio_render_client: IAudioRenderClient| {
                                                                unsafe { audio_client.GetService() }
                                                                    .and_then(|audio_session_control: IAudioSessionControl| {
                                                                        unsafe {
                                                                            audio_session_control
                                                                                .RegisterAudioSessionNotification(
                                                                                    audio_session_events
                                                                                )
                                                                        }
                                                                            .map(|_| Self {
                                                                                audio_client,
                                                                                mix_format_ptr,
                                                                                expected_format,
                                                                                buffer_frame_count,
                                                                                audio_clock,
                                                                                audio_render_client,
                                                                                audio_session_control,
                                                                            })
                                                                    })
                                                            })
                                                    })
                                            })
                                            .map_err(|_| DeviceException::SilentException)
                                    })
                                    .inspect_err(|_| unsafe {
                                        CoTaskMemFree(Some(mix_format_ptr as *const _));
                                    })
                            })
                    })
            }
        }

        pub struct DeviceScheduler<'b, 'c> {
            device: IMMDevice,
            correctable_parts: CorrectableParts,
            event_handle: &'b HANDLE,
            audio_session_events: &'c IAudioSessionEvents,
            has_started: bool,
            has_finished: bool,
        }

        impl<'b, 'c> Deref for DeviceScheduler<'b, 'c> {
            type Target = CorrectableParts;

            fn deref(&self) -> &Self::Target {
                &self.correctable_parts
            }
        }

        impl<'b, 'c>
            TryFrom<(
                &AudioEndpoint,
                &IMMDeviceEnumerator,
                &'b HANDLE,
                &'c IAudioSessionEvents,
            )> for DeviceScheduler<'b, 'c>
        {
            type Error = DeviceException;

            fn try_from(
                (endpoint, device_enumerator, event_handle, audio_session_events): (
                    &AudioEndpoint,
                    &IMMDeviceEnumerator,
                    &'b HANDLE,
                    &'c IAudioSessionEvents,
                ),
            ) -> Result<Self, Self::Error> {
                match endpoint {
                    AudioEndpoint::Default => {
                        unsafe { device_enumerator.GetDefaultAudioEndpoint(eRender, eMultimedia) }
                            .map_err(|_| DeviceException::NoAvailableDefaultAudioEndpoint)
                    }
                    AudioEndpoint::Custom(target_id) => unsafe {
                        device_enumerator.EnumAudioEndpoints(eRender, DEVICE_STATE_ACTIVE)
                    }
                    .map_err(|_| DeviceException::UnavailableCustomAudioEndpoint)
                    .and_then(|device_list| {
                        for index in 0..unsafe { device_list.GetCount() }.unwrap_or(0) {
                            if let Ok(device) = unsafe { device_list.Item(index) }
                                && let Ok(id) = unsafe { device.GetId() }
                                && let Ok(id) = unsafe { id.to_string() }
                                && id.contains(target_id)
                            {
                                return Ok(device);
                            }
                        }

                        Err(DeviceException::UnavailableCustomAudioEndpoint)
                    }),
                }
                .and_then(|device| {
                    CorrectableParts::try_from((&device, event_handle, audio_session_events)).map(
                        |correctable_parts| Self {
                            device,
                            correctable_parts,
                            event_handle,
                            audio_session_events,
                            has_started: false,
                            has_finished: false,
                        },
                    )
                })
            }
        }

        impl<'b, 'c> DeviceScheduler<'b, 'c> {
            fn fill_to_buffer_slice<T>(
                buffer_slice: &mut [T],
                mut source: IntoIter<[f32; 2]>,
                volume: f32,
            ) where
                T: FromSample<f32>,
            {
                for step_index in (0..buffer_slice.len()).step_by(2) {
                    let [left, right] = source.next().unwrap_or([0_f32, 0_f32]);

                    buffer_slice[step_index] = (left * volume).into_sample();

                    buffer_slice[step_index + 1] = (right * volume).into_sample();
                }
            }

            fn dispose(&mut self) {
                self.pause();

                let _ = unsafe {
                    self.audio_session_control
                        .UnregisterAudioSessionNotification(self.audio_session_events)
                };

                unsafe {
                    CoTaskMemFree(Some(self.mix_format_ptr as *const _));
                }
            }

            pub fn get_sample_rate(&self) -> u32 {
                self.expected_format.1
            }

            pub fn get_has_started(&self) -> bool {
                self.has_started
            }

            pub fn get_expected_frame_count(&mut self) -> Result<u32, DeviceException> {
                if self.has_started
                    && unsafe { WaitForSingleObject(*self.event_handle, 2000) } != WAIT_OBJECT_0
                {
                    return Err(DeviceException::FatalException);
                }

                unsafe { self.audio_client.GetCurrentPadding() }
                    .map_err(|_| DeviceException::SilentException)
                    .map(|unread_frame_count| self.buffer_frame_count - unread_frame_count)
                    .inspect_err(|_| {
                        self.pause();
                    })
            }

            pub fn get_timeline_offset(&mut self) -> Result<f64, DeviceException> {
                let mut position = 0_u64;

                let position_ptr = &mut position as *mut u64;

                unsafe { self.audio_clock.GetPosition(position_ptr, None) }
                    .and_then(|_| unsafe { self.audio_clock.GetFrequency() })
                    .map_err(|_| DeviceException::SilentException)
                    .map(|frequency| position as f64 / frequency as f64)
            }

            pub fn play(
                &mut self,
                source: Option<SourceStream>,
                volume: f32,
            ) -> Result<bool, DeviceException> {
                if !self.has_finished {
                    let mut drain_is_necessary = false;

                    if let Some(source) = match source {
                        Some(source) => match source {
                            SourceStream::Continue(source) => Some(source),
                            SourceStream::Break(source) => {
                                drain_is_necessary = true;

                                Some(source)
                            }
                        },
                        None => {
                            drain_is_necessary = true;

                            None
                        }
                    } {
                        let source_frame_count = source.len();

                        match unsafe {
                            self.audio_render_client
                                .GetBuffer(source_frame_count as u32)
                        }
                        .map(|buffer_ptr| {
                            if source_frame_count == 0 {
                                return;
                            }

                            let mut source = source.into_iter();

                            match self.expected_format.0 {
                                SampleFormat::S8 => {
                                    let buffer_slice = unsafe {
                                        slice::from_raw_parts_mut(
                                            buffer_ptr as *mut i8,
                                            source_frame_count * 2,
                                        )
                                    };

                                    Self::fill_to_buffer_slice(buffer_slice, source, volume);
                                }
                                SampleFormat::S16 => {
                                    let buffer_slice = unsafe {
                                        slice::from_raw_parts_mut(
                                            buffer_ptr as *mut i16,
                                            source_frame_count * 2,
                                        )
                                    };

                                    Self::fill_to_buffer_slice(buffer_slice, source, volume);
                                }
                                SampleFormat::S24 => {
                                    let buffer_slice = unsafe {
                                        slice::from_raw_parts_mut(
                                            buffer_ptr,
                                            source_frame_count * 6,
                                        )
                                    };

                                    for step_index in (0..buffer_slice.len()).step_by(6) {
                                        let [left, right] = source.next().unwrap_or([0_f32, 0_f32]);

                                        let left: i24 = (left * volume).into_sample();

                                        let [left_0, left_1, left_2] = left.to_ne_bytes();

                                        let right: i24 = (right * volume).into_sample();

                                        let [right_0, right_1, right_2] = right.to_ne_bytes();

                                        buffer_slice[step_index] = left_0;

                                        buffer_slice[step_index + 1] = left_1;

                                        buffer_slice[step_index + 2] = left_2;

                                        buffer_slice[step_index + 3] = right_0;

                                        buffer_slice[step_index + 4] = right_1;

                                        buffer_slice[step_index + 5] = right_2;
                                    }
                                }
                                SampleFormat::S32 => {
                                    let buffer_slice = unsafe {
                                        slice::from_raw_parts_mut(
                                            buffer_ptr as *mut i32,
                                            source_frame_count * 2,
                                        )
                                    };

                                    Self::fill_to_buffer_slice(buffer_slice, source, volume);
                                }
                                SampleFormat::F32 => {
                                    let buffer_slice = unsafe {
                                        slice::from_raw_parts_mut(
                                            buffer_ptr as *mut f32,
                                            source_frame_count * 2,
                                        )
                                    };

                                    for step_index in (0..buffer_slice.len()).step_by(2) {
                                        let [left, right] = source.next().unwrap_or([0_f32, 0_f32]);

                                        buffer_slice[step_index] = left * volume;

                                        buffer_slice[step_index + 1] = right * volume;
                                    }
                                }
                                _ => unreachable!(),
                            }
                        })
                        .and_then(|_| unsafe {
                            self.audio_render_client
                                .ReleaseBuffer(source_frame_count as u32, 0)
                        }) {
                            Ok(_) => {
                                if !self.has_started {
                                    match unsafe { self.audio_client.Start() } {
                                        Ok(_) => {
                                            self.has_started = true;
                                        }
                                        Err(_) => {
                                            return Err(DeviceException::SilentException);
                                        }
                                    }
                                }
                            }
                            Err(_) => {
                                self.pause();

                                return Err(DeviceException::SilentException);
                            }
                        };
                    };

                    if drain_is_necessary {
                        loop {
                            match unsafe { self.audio_client.GetCurrentPadding() } {
                                Ok(unread_frame_count) => {
                                    if unread_frame_count == 0 {
                                        break;
                                    }
                                }
                                Err(_) => {
                                    self.pause();

                                    return Err(DeviceException::SilentException);
                                }
                            }

                            thread::sleep(Duration::from_millis(10));
                        }

                        self.pause();

                        self.has_finished = true;

                        Ok(true)
                    } else {
                        Ok(false)
                    }
                } else {
                    Ok(false)
                }
            }

            pub fn pause(&mut self) {
                if self.has_started {
                    self.has_started = false;

                    let _ = unsafe { self.audio_client.Stop() };

                    let _ = unsafe { ResetEvent(*self.event_handle) };
                }
            }

            pub fn correct_device_format(&mut self) -> Result<(), DeviceException> {
                self.dispose();

                CorrectableParts::try_from((
                    &self.device,
                    self.event_handle,
                    self.audio_session_events,
                ))
                .map(|correctable_parts| {
                    self.correctable_parts = correctable_parts;
                })
            }

            pub fn reset_buffer(&mut self) {
                self.pause();

                let _ = unsafe { self.audio_client.Reset() };

                self.has_finished = false;
            }
        }

        impl<'b, 'c> Drop for DeviceScheduler<'b, 'c> {
            fn drop(&mut self) {
                self.dispose();
            }
        }
    }

    pub use device_scheduler::DeviceScheduler;

    pub enum SourceStream {
        Continue(Vec<[f32; 2]>),
        Break(Vec<[f32; 2]>),
    }

    pub struct SourceScheduler<'a> {
        format: Box<dyn FormatReader>,
        track_id: u32,
        sample_rate: u32,
        output_sample_rate: u32,
        duration: u32,
        decoder: Box<dyn Decoder>,
        resampler: &'a mut SincFixedIn<f32>,
        resampler_delay_count: u32,
        has_trimmed_delay: bool,
        resampler_input_count: u32,
        resampler_output_count: u32,
        packet_buffer: [VecDeque<f32>; 2],
        source_buffer: VecDeque<[f32; 2]>,
    }

    impl<'a> TryFrom<(&String, &'a mut SincFixedIn<f32>)> for SourceScheduler<'a> {
        type Error = SourceException;

        fn try_from(
            (path, resampler): (&String, &'a mut SincFixedIn<f32>),
        ) -> Result<Self, Self::Error> {
            File::open(path)
                .map_err(|_| SourceException::InvalidFile)
                .and_then(|file| {
                    let mut hint = Hint::new();

                    if path.ends_with(".flac") {
                        hint.with_extension("flac");
                    } else if path.ends_with(".mp3") {
                        hint.with_extension("mp3");
                    }

                    Symphonia::get_probe()
                        .format(
                            &hint,
                            MediaSourceStream::new(Box::new(file), Default::default()),
                            &Default::default(),
                            &Default::default(),
                        )
                        .map_err(|_| SourceException::InvalidFile)
                })
                .and_then(|ProbeResult { format, .. }| {
                    format
                        .tracks()
                        .iter()
                        .find(|track| track.codec_params.codec != CODEC_TYPE_NULL)
                        .and_then(
                            |Track {
                                 id, codec_params, ..
                             }| {
                                codec_params
                                    .channels
                                    .and_then(|channels| {
                                        (channels.count() == 2)
                                            .then_some(())
                                            .and(codec_params.sample_rate)
                                    })
                                    .and_then(|sample_rate| {
                                        (44_100..=192_000)
                                            .contains(&sample_rate)
                                            .then_some(sample_rate)
                                    })
                                    .and_then(|sample_rate| {
                                        codec_params
                                            .time_base
                                            .and_then(|time_base| {
                                                codec_params.n_frames.map(|frame_count| {
                                                    time_base.calc_time(frame_count).seconds as u32
                                                })
                                            })
                                            .and_then(|duration| {
                                                Symphonia::get_codecs()
                                                    .make(codec_params, &Default::default())
                                                    .map(|decoder| {
                                                        (*id, sample_rate, duration, decoder)
                                                    })
                                                    .ok()
                                            })
                                    })
                            },
                        )
                        .inspect(|_| {
                            resampler.reset();
                        })
                        .map(|(track_id, sample_rate, duration, decoder)| {
                            let resampler_delay_count = resampler.output_delay() as u32;

                            Self {
                                format,
                                track_id,
                                sample_rate,
                                output_sample_rate: sample_rate,
                                duration,
                                decoder,
                                resampler,
                                resampler_delay_count,
                                has_trimmed_delay: false,
                                resampler_input_count: 0,
                                resampler_output_count: 0,
                                packet_buffer: [VecDeque::new(), VecDeque::new()],
                                source_buffer: VecDeque::new(),
                            }
                        })
                        .ok_or(SourceException::InvalidFile)
                })
        }
    }

    impl<'a> SourceScheduler<'a> {
        fn append_to_packet_buffer<T>(
            source: &AudioBuffer<T>,
            target: &mut [VecDeque<f32>; 2],
        ) -> u32
        where
            T: Sample + IntoSample<f32>,
        {
            let zeroth_channel = source.chan(0);

            let first_channel = source.chan(1);

            target[0].reserve(zeroth_channel.len());

            target[1].reserve(first_channel.len());

            zeroth_channel
                .iter()
                .zip(first_channel)
                .map(|(zeroth, first)| {
                    target[0].push_back((*zeroth).into_sample());

                    target[1].push_back((*first).into_sample());
                })
                .count() as u32
        }

        fn request_packet_and_append_to_buffer(
            format: &mut Box<dyn FormatReader>,
            track_id: u32,
            decoder: &mut Box<dyn Decoder>,
            packet_buffer: &mut [VecDeque<f32>; 2],
        ) -> Result<u32, SourceException> {
            loop {
                let packet = match format.next_packet() {
                    Ok(packet) => packet,
                    Err(SymphoniaError::IoError(error))
                        if error.kind() == IOErrorKind::UnexpectedEof
                            && error.to_string() == "end of stream" =>
                    {
                        return Ok(0);
                    }
                    Err(_) => {
                        return Err(SourceException::IncorrectFile);
                    }
                };

                if packet.track_id() != track_id {
                    continue;
                }

                match decoder.decode(&packet) {
                    Ok(decoded) => {
                        return Ok(match decoded {
                            AudioBufferRef::U8(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::U16(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::U24(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::U32(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::S8(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::S16(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::S24(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::S32(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::F32(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                            AudioBufferRef::F64(source) => {
                                Self::append_to_packet_buffer(&source, packet_buffer)
                            }
                        });
                    }
                    Err(SymphoniaError::IoError(_)) | Err(SymphoniaError::DecodeError(_)) => {
                        continue;
                    }
                    Err(_) => {
                        return Err(SourceException::IncorrectFile);
                    }
                }
            }
        }

        fn append_to_source_buffer(source: Vec<Vec<f32>>, target: &mut VecDeque<[f32; 2]>) -> u32 {
            let mut source_iter = source.into_iter();

            let zeroth_channel = source_iter.next().unwrap_or_default();

            let first_channel = source_iter.next().unwrap_or_default();

            target.reserve(min(zeroth_channel.len(), first_channel.len()));

            zeroth_channel
                .into_iter()
                .zip(first_channel)
                .map(|(zeroth, first)| {
                    target.push_back([zeroth, first]);
                })
                .count() as u32
        }

        pub fn set_output_sample_rate(&mut self, output_sample_rate: u32) {
            self.output_sample_rate = output_sample_rate;

            let _ = self.resampler.set_resample_ratio(
                self.output_sample_rate as f64 / self.sample_rate as f64,
                false,
            );

            self.resampler_delay_count = self.resampler.output_delay() as u32;
        }

        pub fn get_duration(&self) -> u32 {
            self.duration
        }

        pub fn request_source_stream(
            &mut self,
            expected_frame_count: u32,
        ) -> Result<Option<SourceStream>, SourceException> {
            let expected_frame_count = if self.has_trimmed_delay {
                expected_frame_count
            } else {
                expected_frame_count + self.resampler_delay_count
            };

            let mut source_stream = 'entry: loop {
                let source_buffer_count = self.source_buffer.len();

                if source_buffer_count >= expected_frame_count as usize {
                    break 'entry SourceStream::Continue(
                        self.source_buffer
                            .drain(..expected_frame_count as usize)
                            .collect(),
                    );
                } else {
                    let wave_in_count = self.resampler.input_frames_next();

                    loop {
                        if self.packet_buffer[1].len() >= wave_in_count {
                            self.resampler_input_count += wave_in_count as u32;

                            if let Ok(source) = self.resampler.process(
                                &[
                                    self.packet_buffer[0]
                                        .drain(..wave_in_count)
                                        .collect::<Vec<f32>>(),
                                    self.packet_buffer[1]
                                        .drain(..wave_in_count)
                                        .collect::<Vec<f32>>(),
                                ],
                                None,
                            ) {
                                self.resampler_output_count +=
                                    Self::append_to_source_buffer(source, &mut self.source_buffer);
                            } else {
                                return Err(SourceException::IncorrectFile);
                            }

                            continue 'entry;
                        } else {
                            match Self::request_packet_and_append_to_buffer(
                                &mut self.format,
                                self.track_id,
                                &mut self.decoder,
                                &mut self.packet_buffer,
                            ) {
                                Ok(appended_packet_buffer_count) => {
                                    if appended_packet_buffer_count > 0 {
                                        continue;
                                    } else {
                                        break;
                                    }
                                }
                                Err(error) => {
                                    return Err(error);
                                }
                            }
                        }
                    }

                    let packet_buffer_count = self.packet_buffer[1].len();

                    if packet_buffer_count > 0 {
                        self.resampler_input_count += packet_buffer_count as u32;

                        if let Ok(source) = self
                            .resampler
                            .set_chunk_size(packet_buffer_count)
                            .and_then(|_| {
                                self.resampler.process(
                                    &[
                                        self.packet_buffer[0].drain(..).collect::<Vec<f32>>(),
                                        self.packet_buffer[1].drain(..).collect::<Vec<f32>>(),
                                    ],
                                    None,
                                )
                            })
                        {
                            self.resampler_output_count +=
                                Self::append_to_source_buffer(source, &mut self.source_buffer);
                        } else {
                            return Err(SourceException::IncorrectFile);
                        }

                        continue 'entry;
                    }

                    if ((self.resampler_output_count - self.resampler_delay_count) as u64
                        * self.sample_rate as u64)
                        < (self.resampler_input_count as u64 * self.output_sample_rate as u64)
                    {
                        loop {
                            if let Ok(source) =
                                self.resampler.process_partial::<Vec<f32>>(None, None)
                            {
                                self.resampler_output_count +=
                                    Self::append_to_source_buffer(source, &mut self.source_buffer);
                            } else {
                                return Err(SourceException::IncorrectFile);
                            }

                            if ((self.resampler_output_count - self.resampler_delay_count) as u64
                                * self.sample_rate as u64)
                                >= (self.resampler_input_count as u64
                                    * self.output_sample_rate as u64)
                            {
                                self.source_buffer.truncate(
                                    self.source_buffer.len()
                                        + (self.output_sample_rate as f32 / self.sample_rate as f32
                                            * self.resampler_input_count as f32)
                                            .floor()
                                            as usize
                                        + self.resampler_delay_count as usize
                                        - self.resampler_output_count as usize,
                                );

                                continue 'entry;
                            }
                        }
                    }

                    if source_buffer_count > 0 {
                        break 'entry SourceStream::Break(self.source_buffer.drain(..).collect());
                    } else {
                        return Ok(None);
                    }
                };
            };

            if !self.has_trimmed_delay {
                self.has_trimmed_delay = true;

                let source_stream = match source_stream {
                    SourceStream::Continue(ref mut source_stream) => source_stream,
                    SourceStream::Break(ref mut source_stream) => source_stream,
                };

                if source_stream.len() > self.resampler_delay_count as usize {
                    let _ = source_stream.drain(..self.resampler_delay_count as usize);
                } else {
                    return Err(SourceException::IncorrectFile);
                }
            }

            Ok(Some(source_stream))
        }

        pub fn seek(
            &mut self,
            second: u32,
            fraction: Option<f64>,
        ) -> Result<(u32, f64), SourceException> {
            self.format
                .seek(
                    SeekMode::Accurate,
                    SeekTo::Time {
                        time: Time::new(second as u64, fraction.unwrap_or(0_f64)),
                        track_id: Some(self.track_id),
                    },
                )
                .map_err(|_| SourceException::IncorrectFile)
                .map(|SeekedTo { actual_ts, .. }| {
                    self.decoder.reset();

                    self.resampler.reset();

                    self.has_trimmed_delay = false;

                    self.resampler_input_count = 0;

                    self.resampler_output_count = 0;

                    self.packet_buffer = [VecDeque::new(), VecDeque::new()];

                    self.source_buffer = VecDeque::new();

                    self.decoder
                        .codec_params()
                        .time_base
                        .map(|time_base| {
                            let Time { seconds, frac } = time_base.calc_time(actual_ts);

                            (seconds as u32, frac)
                        })
                        .unwrap_or((second, fraction.unwrap_or(0_f64)))
                })
        }

        pub fn determine_additional_seek_necessity(&self) -> bool {
            self.has_trimmed_delay
        }
    }
}

use scheduler::*;

fn run_player_loop(
    background_event_tx: mpsc::Sender<Command>,
    command_scheduler: CommandScheduler,
    active_action_handler: ThreadsafeFunction<
        (String, Option<String>),
        ErrorStrategy::CalleeHandled,
    >,
) {
    let mut audio_endpoint_is_default = false;

    let mut volume = Volume::new(1_f64);

    let mut identifier = None;

    let mut timeline_anchor = 0_f64;

    let mut progress = timeline_anchor;

    let mut is_playing = false;

    let notification_client: IMMNotificationClient = MMNotificationClient {
        tx: background_event_tx.clone(),
    }
    .into();

    let audio_session_events: IAudioSessionEvents = AudioSessionEvents {
        tx: background_event_tx,
    }
    .into();

    if let Ok((device_enumerator, event_handle, mut resampler)) =
        DeviceEnumerator::init(&notification_client)
            .and_then(|device_enumerator| {
                unsafe { CreateEventW(None, false, false, None) }
                    .map_err(|_| DeviceException::FatalException)
                    .map(|event_handle| (device_enumerator, event_handle))
            })
            .and_then(|(device_enumerator, event_handle)| {
                SincFixedIn::<f32>::new(
                    1_f64,
                    5_f64,
                    SincInterpolationParameters {
                        sinc_len: 256,
                        f_cutoff: 0.95,
                        oversampling_factor: 256,
                        interpolation: SincInterpolationType::Linear,
                        window: WindowFunction::BlackmanHarris2,
                    },
                    1024,
                    2,
                )
                .map_err(|_| DeviceException::FatalException)
                .inspect_err(|_| {
                    let _ = unsafe { CloseHandle(event_handle) };
                })
                .map(|resampler| (device_enumerator, event_handle, resampler))
            })
            .inspect_err(|_| {
                active_action_handler.call(
                    Ok((String::from("initialization"), Some(String::from("false")))),
                    ThreadsafeFunctionCallMode::Blocking,
                );
            })
    {
        active_action_handler.call(
            Ok((String::from("initialization"), Some(String::from("true")))),
            ThreadsafeFunctionCallMode::Blocking,
        );

        let mut device_scheduler = Option::<Result<DeviceScheduler, DeviceScheduler>>::None;

        let mut source_scheduler = Option::<SourceScheduler>::None;

        'entry: loop {
            for command in command_scheduler.backlog_into_iter(
                !device_scheduler
                    .as_ref()
                    .and_then(|device_scheduler| device_scheduler.as_ref().ok())
                    .is_some_and(|device_scheduler| device_scheduler.get_has_started()),
            ) {
                let mut device_scheduler_is_update_with_sample_rate = None;

                let mut source_scheduler_is_update = false;

                let mut pause_is_necessary = false;

                let mut seek_is_necessary_with_second = None;

                let mut source_scheduler_is_incorrect_with_error = None;

                let mut timeline_anchor_is_update = false;

                let mut playback_state_is_update = false;

                match command {
                    Command::SelectMode(new_audio_endpoint, new_volume) => {
                        audio_endpoint_is_default = match new_audio_endpoint {
                            AudioEndpoint::Default => true,
                            AudioEndpoint::Custom(_) => false,
                        };

                        volume = new_volume;

                        match DeviceScheduler::try_from((
                            &new_audio_endpoint,
                            device_enumerator.get(),
                            &event_handle,
                            &audio_session_events,
                        )) {
                            Ok(new_device_scheduler) => {
                                device_scheduler_is_update_with_sample_rate =
                                    Some(new_device_scheduler.get_sample_rate());

                                device_scheduler = Some(Ok(new_device_scheduler));
                            }
                            Err(error) => {
                                device_scheduler = None;

                                active_action_handler.call(
                                    Ok((String::from("exception"), Some(String::from(match error {
                                        DeviceException::NoAvailableDefaultAudioEndpoint => "\"DeviceException::NoAvailableDefaultAudioEndpoint\"",
                                        DeviceException::UnavailableCustomAudioEndpoint => "\"DeviceException::UnavailableCustomAudioEndpoint\"",
                                        DeviceException::UnsupportedDeviceFormat => "\"DeviceException::UnsupportedDeviceFormat\"",
                                        DeviceException::SilentException => "\"DeviceException::SilentException\"",
                                        _ => unreachable!()
                                    })))),
                                    ThreadsafeFunctionCallMode::Blocking,
                                );
                            }
                        }
                    }
                    Command::CorrectAudioEndpointDefault => {
                        if audio_endpoint_is_default {
                            match DeviceScheduler::try_from((
                                &AudioEndpoint::Default,
                                device_enumerator.get(),
                                &event_handle,
                                &audio_session_events,
                            )) {
                                Ok(new_device_scheduler) => {
                                    device_scheduler_is_update_with_sample_rate =
                                        Some(new_device_scheduler.get_sample_rate());

                                    device_scheduler = Some(Ok(new_device_scheduler));
                                }
                                Err(error) => {
                                    device_scheduler = None;

                                    active_action_handler.call(
                                        Ok((String::from("exception"), Some(String::from(match error {
                                            DeviceException::NoAvailableDefaultAudioEndpoint => "\"DeviceException::NoAvailableDefaultAudioEndpoint\"",
                                            DeviceException::UnsupportedDeviceFormat => "\"DeviceException::UnsupportedDeviceFormat\"",
                                            DeviceException::SilentException => "\"DeviceException::SilentException\"",
                                            _ => unreachable!()
                                        })))),
                                        ThreadsafeFunctionCallMode::Blocking,
                                    );
                                }
                            }
                        }
                    }
                    Command::CorrectDeviceFormat => {
                        let mut device_scheduler_is_invalid = false;

                        let mut position_restore_is_necessary = false;

                        if let Some(device_scheduler) = device_scheduler.as_mut() {
                            match match device_scheduler {
                                Ok(device_scheduler) => device_scheduler,
                                Err(device_scheduler) => device_scheduler,
                            }
                            .correct_device_format()
                            {
                                Ok(_) => {
                                    device_scheduler_is_update_with_sample_rate = Some(
                                        match device_scheduler {
                                            Ok(device_scheduler) => device_scheduler,
                                            Err(device_scheduler) => device_scheduler,
                                        }
                                        .get_sample_rate(),
                                    );

                                    position_restore_is_necessary = true;
                                }
                                Err(error) => {
                                    device_scheduler_is_invalid = true;

                                    active_action_handler.call(
                                        Ok((
                                            String::from("exception"),
                                            Some(String::from(match error {
                                                DeviceException::UnsupportedDeviceFormat => {
                                                    "\"DeviceException::UnsupportedDeviceFormat\""
                                                }
                                                DeviceException::SilentException => {
                                                    "\"DeviceException::SilentException\""
                                                }
                                                _ => unreachable!(),
                                            })),
                                        )),
                                        ThreadsafeFunctionCallMode::Blocking,
                                    );
                                }
                            }
                        }

                        if device_scheduler_is_invalid {
                            device_scheduler = None;
                        } else if position_restore_is_necessary {
                            let origin_device_scheduler = device_scheduler.take();

                            if let Some(Err(origin_device_scheduler)) = origin_device_scheduler {
                                device_scheduler = Some(Ok(origin_device_scheduler));
                            } else {
                                device_scheduler = origin_device_scheduler;
                            }
                        }
                    }
                    Command::ModifyVolume(new_volume) => {
                        volume = new_volume;
                    }
                    Command::SelectTrack(path, new_identifier) => {
                        identifier = Some(new_identifier);

                        source_scheduler_is_update = true;

                        match SourceScheduler::try_from((&path, &mut resampler)) {
                            Ok(new_source_scheduler) => {
                                source_scheduler = Some(new_source_scheduler);
                            }
                            Err(error) => {
                                source_scheduler = None;

                                active_action_handler.call(
                                    Ok((
                                        String::from("exception"),
                                        Some(format!(
                                            "\"{}::{}\"",
                                            match error {
                                                SourceException::InvalidFile =>
                                                    "SourceException::InvalidFile",
                                                _ => unreachable!(),
                                            },
                                            identifier.as_ref().unwrap_or(&String::from("NIL"))
                                        )),
                                    )),
                                    ThreadsafeFunctionCallMode::Blocking,
                                );
                            }
                        }
                    }
                    Command::ClearTrack => {
                        identifier = None;

                        source_scheduler_is_update = true;

                        pause_is_necessary = true;

                        source_scheduler = None;
                    }
                    Command::Seek(second) => {
                        seek_is_necessary_with_second = Some(
                            second.clamp(
                                0,
                                source_scheduler
                                    .as_ref()
                                    .map_or(0, |source_scheduler| source_scheduler.get_duration()),
                            ),
                        );
                    }
                    Command::Play => {
                        if identifier.is_some() {
                            is_playing = true;

                            playback_state_is_update = true;
                        }
                    }
                    Command::Pause => {
                        pause_is_necessary = true;
                    }
                    Command::Stop => {
                        pause_is_necessary = true;

                        seek_is_necessary_with_second = Some(0);
                    }
                    Command::Close => {
                        break 'entry;
                    }
                }

                if let Some(sample_rate) = device_scheduler_is_update_with_sample_rate
                    && let Some(source_scheduler) = source_scheduler.as_mut()
                {
                    if source_scheduler.determine_additional_seek_necessity() {
                        match source_scheduler.seek(progress.floor() as u32, Some(progress.fract()))
                        {
                            Ok((second, fraction)) => {
                                timeline_anchor = second as f64 + fraction;

                                timeline_anchor_is_update = true;
                            }
                            Err(error) => {
                                source_scheduler_is_incorrect_with_error = Some(error);
                            }
                        }
                    }

                    source_scheduler.set_output_sample_rate(sample_rate);
                }

                if source_scheduler_is_update {
                    active_action_handler.call(
                        Ok((
                            String::from("track"),
                            Some(format!(
                                "\"{}\"",
                                identifier.as_ref().unwrap_or(&String::from("NIL"))
                            )),
                        )),
                        ThreadsafeFunctionCallMode::Blocking,
                    );

                    timeline_anchor = 0_f64;

                    timeline_anchor_is_update = true;

                    if let Some(Ok(device_scheduler)) = device_scheduler.as_mut() {
                        if let Some(source_scheduler) = source_scheduler.as_mut() {
                            source_scheduler
                                .set_output_sample_rate(device_scheduler.get_sample_rate());
                        }

                        device_scheduler.reset_buffer();
                    }
                }

                if pause_is_necessary {
                    is_playing = false;

                    playback_state_is_update = true;
                }

                if let Some(second) = seek_is_necessary_with_second {
                    timeline_anchor = second as f64;

                    timeline_anchor_is_update = true;

                    if let Some(source_scheduler) = source_scheduler.as_mut() {
                        match source_scheduler.seek(second, None) {
                            Ok((second, fraction)) => {
                                timeline_anchor = second as f64 + fraction;

                                if let Some(Ok(device_scheduler)) = device_scheduler.as_mut() {
                                    source_scheduler
                                        .set_output_sample_rate(device_scheduler.get_sample_rate());

                                    device_scheduler.reset_buffer();
                                }
                            }
                            Err(error) => {
                                source_scheduler_is_incorrect_with_error = Some(error);
                            }
                        }
                    }
                }

                if let Some(error) = source_scheduler_is_incorrect_with_error {
                    source_scheduler = None;

                    active_action_handler.call(
                        Ok((
                            String::from("exception"),
                            Some(format!(
                                "\"{}::{}\"",
                                match error {
                                    SourceException::IncorrectFile =>
                                        "SourceException::IncorrectFile",
                                    _ => unreachable!(),
                                },
                                identifier.as_ref().unwrap_or(&String::from("NIL"))
                            )),
                        )),
                        ThreadsafeFunctionCallMode::Blocking,
                    );
                }

                if timeline_anchor_is_update {
                    progress = timeline_anchor;

                    active_action_handler.call(
                        Ok((
                            String::from("progress"),
                            Some((progress.floor() as u32).to_string()),
                        )),
                        ThreadsafeFunctionCallMode::Blocking,
                    );
                }

                if playback_state_is_update {
                    active_action_handler.call(
                        Ok((
                            String::from("state"),
                            Some(format!("\"{}\"", if is_playing { "play" } else { "pause" })),
                        )),
                        ThreadsafeFunctionCallMode::Blocking,
                    );
                }
            }

            if !(is_playing && source_scheduler.is_some())
                && let Some(Ok(device_scheduler)) = device_scheduler.as_mut()
            {
                device_scheduler.pause();
            }

            let mut device_scheduler_is_invalid_with_error = None;

            let mut source_scheduler_is_incorrect = false;

            if is_playing
                && let Some(Ok(device_scheduler)) = device_scheduler.as_mut()
                && let Some(source_scheduler) = source_scheduler.as_mut()
            {
                match device_scheduler.get_expected_frame_count() {
                    Ok(expected_frame_count) => {
                        if let Ok(source) =
                            source_scheduler.request_source_stream(expected_frame_count)
                        {
                            if let Ok(has_finished) = device_scheduler.play(source, volume.get()) {
                                if has_finished {
                                    progress = source_scheduler.get_duration() as f64;
                                } else if let Ok(timeline_offset) =
                                    device_scheduler.get_timeline_offset()
                                {
                                    progress = timeline_anchor + timeline_offset;
                                } else {
                                    device_scheduler_is_invalid_with_error =
                                        Some(DeviceException::SilentException);
                                }

                                active_action_handler.call(
                                    Ok((
                                        String::from("progress"),
                                        Some((progress.floor() as u32).to_string()),
                                    )),
                                    ThreadsafeFunctionCallMode::Blocking,
                                );

                                if has_finished {
                                    active_action_handler.call(
                                        Ok((String::from("finish"), None)),
                                        ThreadsafeFunctionCallMode::Blocking,
                                    );
                                }
                            } else {
                                device_scheduler_is_invalid_with_error =
                                    Some(DeviceException::SilentException);
                            }
                        } else {
                            source_scheduler_is_incorrect = true;
                        }
                    }
                    Err(error) => {
                        device_scheduler_is_invalid_with_error = Some(error);
                    }
                }
            }

            if let Some(error) = device_scheduler_is_invalid_with_error {
                if let Some(Ok(device_scheduler)) = device_scheduler.as_mut() {
                    device_scheduler.reset_buffer();
                }

                let origin_device_scheduler = device_scheduler.take();

                if let Some(Ok(origin_device_scheduler)) = origin_device_scheduler {
                    device_scheduler = Some(Err(origin_device_scheduler));
                } else {
                    device_scheduler = origin_device_scheduler;
                }

                active_action_handler.call(
                    Ok((
                        String::from("exception"),
                        Some(String::from(match error {
                            DeviceException::FatalException => {
                                "\"DeviceException::FatalException\""
                            }
                            DeviceException::SilentException => {
                                "\"DeviceException::SilentException\""
                            }
                            _ => unreachable!(),
                        })),
                    )),
                    ThreadsafeFunctionCallMode::Blocking,
                );
            }

            if source_scheduler_is_incorrect {
                source_scheduler = None;

                active_action_handler.call(
                    Ok((
                        String::from("exception"),
                        Some(format!(
                            "\"SourceException::IncorrectFile::{}\"",
                            identifier.as_ref().unwrap_or(&String::from("NIL"))
                        )),
                    )),
                    ThreadsafeFunctionCallMode::Blocking,
                );
            }
        }

        let _ = unsafe { CloseHandle(event_handle) };
    }
}

#[napi]
pub struct Player {
    background_task_tx: Option<mpsc::Sender<Command>>,
    background_task_handle: Option<thread::JoinHandle<()>>,
}

#[napi]
impl Player {
    fn open(
        active_action_handler: JsFunction,
    ) -> (
        Option<mpsc::Sender<Command>>,
        Option<thread::JoinHandle<()>>,
    ) {
        let active_action_handler: napi::Result<
            ThreadsafeFunction<(String, Option<String>), ErrorStrategy::CalleeHandled>,
        > = active_action_handler.create_threadsafe_function(0, |ctx| {
            let (event_name, serialized_data): (String, Option<String>) = ctx.value;

            Ok(vec![
                ctx.env.create_string_from_std(event_name)?,
                ctx.env
                    .create_string_from_std(serialized_data.unwrap_or(String::from("null")))?,
            ])
        });

        let (background_task_tx, background_task_rx) = mpsc::channel();

        let background_event_tx = background_task_tx.clone();

        active_action_handler
            .ok()
            .map(|active_action_handler| {
                thread::spawn(move || {
                    let _ = unsafe { CoInitializeEx(None, COINIT_MULTITHREADED) };

                    let mut task_index = 0_u32;

                    let task_handle =
                        unsafe { AvSetMmThreadCharacteristicsW(w!("Pro Audio"), &mut task_index) };

                    run_player_loop(
                        background_event_tx,
                        CommandScheduler::new(background_task_rx),
                        active_action_handler,
                    );

                    if let Ok(task_handle) = task_handle {
                        unsafe {
                            let _ = AvRevertMmThreadCharacteristics(task_handle);
                        }
                    }

                    unsafe {
                        CoUninitialize();
                    }
                })
            })
            .map(|background_task_handle| (Some(background_task_tx), Some(background_task_handle)))
            .unwrap_or_default()
    }

    #[napi(
        constructor,
        ts_args_type = "active_action_handler: \
        (error: null | Error, result: 'initialization' | 'exception' | 'track' | 'progress' | 'state' | 'finish', dataJSON: string) => void"
    )]
    pub fn new(active_action_handler: JsFunction) -> Self {
        let (background_task_tx, background_task_handle) = Self::open(active_action_handler);

        Self {
            background_task_tx,
            background_task_handle,
        }
    }

    #[napi(getter)]
    pub fn is_open(&self) -> bool {
        self.background_task_handle.is_some()
    }

    fn player_not_open_error() -> Error {
        Error::new(Status::GenericFailure, "The player service is not open")
    }

    #[napi(ts_return_type = "never | void")]
    pub fn select_mode(
        &self,
        #[napi(ts_arg_type = "'default' | 'custom'")] category: String,
        id: String,
        volume: f64,
    ) -> napi::Result<()> {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.as_ref() {
                let _ = background_task_tx.send(Command::SelectMode(
                    match category.as_str() {
                        "default" => AudioEndpoint::Default,
                        "custom" => AudioEndpoint::Custom(id),
                        _ => AudioEndpoint::Default,
                    },
                    Volume::new(volume),
                ));
            }

            Ok(())
        } else {
            Err(Self::player_not_open_error())
        }
    }

    #[napi(ts_return_type = "never | void")]
    pub fn modify_volume(&self, value: f64) -> napi::Result<()> {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.as_ref() {
                let _ = background_task_tx.send(Command::ModifyVolume(Volume::new(value)));
            }

            Ok(())
        } else {
            Err(Self::player_not_open_error())
        }
    }

    #[napi(ts_return_type = "never | void")]
    pub fn select_file(&self, path: String, identifier: String) -> napi::Result<()> {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.as_ref() {
                let _ = background_task_tx.send(match path.as_str() {
                    "" => Command::ClearTrack,
                    _ => Command::SelectTrack(path, identifier),
                });
            }

            Ok(())
        } else {
            Err(Self::player_not_open_error())
        }
    }

    #[napi(ts_return_type = "never | void")]
    pub fn seek_to(&self, second: f64) -> napi::Result<()> {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.as_ref() {
                let _ = background_task_tx.send(Command::Seek(second.floor() as u32));
            }

            Ok(())
        } else {
            Err(Self::player_not_open_error())
        }
    }

    #[napi(ts_return_type = "never | void")]
    pub fn switch_to(
        &self,
        #[napi(ts_arg_type = "'play' | 'pause' | 'stop'")] state: String,
    ) -> napi::Result<()> {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.as_ref() {
                let _ = background_task_tx.send(match state.as_str() {
                    "play" => Command::Play,
                    "pause" => Command::Pause,
                    "stop" => Command::Stop,
                    _ => Command::Pause,
                });
            }

            Ok(())
        } else {
            Err(Self::player_not_open_error())
        }
    }

    #[napi]
    pub fn close(&mut self) {
        if self.is_open() {
            if let Some(background_task_tx) = self.background_task_tx.take() {
                let _ = background_task_tx.send(Command::Close);
            }

            if let Some(background_task_handle) = self.background_task_handle.take() {
                let _ = background_task_handle.join();
            }
        }
    }
}
