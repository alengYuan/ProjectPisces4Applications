PUSHD .\attachment\node-smtc
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
    move /Y .\attachment\node-smtc\index.d.ts .\source\main\service\smtc.d.ts
)
move /Y .\attachment\node-smtc\rhythm.native.smtc.win32-x64-msvc.node .\module\rhythm-native-smtc.node