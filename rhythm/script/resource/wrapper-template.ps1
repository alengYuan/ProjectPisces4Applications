Get-PackageProvider -Name "NuGet" -ForceBootstrap
if (!(Get-Module -Name "ps2exe" -ListAvailable)) {
    Install-Module -Name "ps2exe" -Scope CurrentUser -Force
}
Invoke-ps2exe `
    -inputFile ".\cache\blitheInstaller.ps1" `
    -outputFile ".\release\package\rhythm-blithe-installer (test only).exe" `
    -x64 `
    -conHost `
    -UNICODEEncoding `
    -iconFile ".\release\package\rhythm\resources\app\source\icon.ico" `
    -embedFiles @{
        ".\_temporary_luggage_rack_\certificate4test.cer"="$((Get-Location).Path)\config\certificate4test.cer"
        ".\_temporary_luggage_rack_\package4test.msix"="$((Get-Location).Path)\release\package\rhythm.signed.msix"
    } `
    -title "Rhythm Blithe Installer" `
    -description "Rhythm Blithe Installer" `
    -company "${publisher}" `
    -product "Rhythm Blithe Installer" `
    -copyright "Copyright (C) 2026 ${publisher}. All rights reserved." `
    -version "${version}.0" `
    -requireAdmin