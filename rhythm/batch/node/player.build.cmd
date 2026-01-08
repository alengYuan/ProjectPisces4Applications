PUSHD .\attachment\node-player
IF DEFINED prod_mode (
    CALL napi build --platform --release
    cargo clean
    del .\index.d.ts
) ELSE (
    CALL napi build --platform
)
del .\index.js
POPD
IF NOT DEFINED prod_mode (
    move /Y .\attachment\node-player\index.d.ts .\source\main\service\player.d.ts
)
move /Y .\attachment\node-player\rhythm.native.player.win32-x64-msvc.node .\module\rhythm-native-player.node