use windows::Storage::ApplicationData;

#[napi]
pub fn request_local_state_path() -> String {
    ApplicationData::Current()
        .and_then(|app_data| app_data.LocalFolder())
        .and_then(|local_folder| local_folder.Path())
        .map_or(String::from(""), |path| path.to_string())
}
