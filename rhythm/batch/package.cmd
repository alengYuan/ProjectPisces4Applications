SETLOCAL
set prod_mode=true
rmdir /S /Q .\release\package
mkdir .\release\package
robocopy .\module\electron .\release\package\rhythm /S /XD resources /COPY:DAT /DCOPY:T /MT:4
mkdir .\release\package\rhythm\resources
CALL .\batch\node\player.build.cmd
CALL .\batch\node\smtc.build.cmd
CALL .\batch\_build.cmd
robocopy .\release\resource .\release\package\rhythm\resources\app /S /COPY:DAT /DCOPY:T /MT:4
robocopy .\package .\release\package\rhythm /S /COPY:DAT /DCOPY:T /MT:4
robocopy .\policy .\release\package\rhythm /S /COPY:DAT /DCOPY:T /MT:4
IF "%1"=="sign" (
    copy /Y .\script\resource\blithe-installer-template.ps1 .\cache\blitheInstaller.ps1
    copy /Y .\script\resource\wrapper-template.ps1 .\cache\wrapper.ps1
    node .\script\generateTestInstallerScript.mjs
    node .\script\generateMSIXFile.mjs --sign
) ELSE (
    node .\script\generateMSIXFile.mjs
)
ENDLOCAL