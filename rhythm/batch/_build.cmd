rmdir /S /Q .\release\resource
mkdir .\release\resource
IF NOT DEFINED dev_mode (
    robocopy .\module .\release\resource\module /S /XD electron /COPY:DAT /DCOPY:T /MT:4
    mkdir .\release\resource\node_modules
    robocopy .\node_modules\better-sqlite3 .\release\resource\node_modules\better-sqlite3 /S /COPY:DAT /DCOPY:T /MT:4
    robocopy .\node_modules\bindings .\release\resource\node_modules\bindings /S /COPY:DAT /DCOPY:T /MT:4
    robocopy .\node_modules\file-uri-to-path .\release\resource\node_modules\file-uri-to-path /S /COPY:DAT /DCOPY:T /MT:4
    robocopy .\source .\release\resource\source /S /XD main preload renderer /XF entry.mjs /COPY:DAT /DCOPY:T /MT:4
) ELSE (
    robocopy .\source .\release\resource\source /S /XD asset main preload renderer /XF entry.mjs /COPY:DAT /DCOPY:T /MT:4
    mklink /D .\release\resource\module ..\..\module
    mklink /D .\release\resource\node_modules ..\..\node_modules
    mklink /D .\release\resource\source\asset ..\..\..\source\asset
)
node .\script\injectTestTool.mjs
node .\node_modules\rollup\dist\bin\rollup -c .\rollup.config.js
node .\script\generateManifestFile.mjs
rmdir /S /Q .\module\electron\resources
mkdir .\module\electron\resources
mklink /D .\module\electron\resources\app ..\..\..\release\resource