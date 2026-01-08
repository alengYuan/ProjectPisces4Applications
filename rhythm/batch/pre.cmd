node .\script\pruneDevDependencies.mjs
set ELECTRON_SKIP_BINARY_DOWNLOAD=1
CALL npm install --verbose
node .\script\repairDevDependencies.mjs
node .\script\initDirectoriesAndFiles.mjs
curl -L --output dev_dependencies.zip https://github.com/alengYuan/ProjectPisces4Applications/releases/download/ver.0.0.0-rhythm/dev_dependencies.zip
%SystemRoot%\System32\tar -xkvf .\dev_dependencies.zip
del .\dev_dependencies.zip