SETLOCAL
set dev_mode=true
CALL .\batch\_build.cmd
START /b "" "node" ".\script\randomAccessStreamPartner.mjs"
.\module\electron\electron.exe
curl --noproxy "*" http://localhost:7986/exit
ENDLOCAL