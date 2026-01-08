$LuggageRootPath = "$((Get-Location).Path)\_temporary_luggage_rack_"
$CertificatePath = "$($LuggageRootPath)\certificate4test.cer"
$PackagePath = "$($LuggageRootPath)\package4test.msix"
$CertificateTarget = "Cert:\LocalMachine\Root"
Write-Host "${name}::${version}.0"
if (-not (Get-ChildItem -Path $CertificateTarget | Where-Object {$_.Thumbprint -eq (Get-PfxCertificate -FilePath $CertificatePath).Thumbprint})) {
    Import-Certificate -FilePath $CertificatePath -CertStoreLocation $CertificateTarget
    Write-Host "Certificate imported successfully..."
} else {
    Write-Host "Required certificate already exists on the system. Import skipped..."
}
$InstalledPackage = Get-AppxPackage -Name "${name}" -AllUsers | Select-Object Version
if ((-not $InstalledPackage) -or ([System.Version]::new($InstalledPackage[0].Version) -lt [System.Version]::new("${version}.0"))) {
    Add-AppxPackage -Path $PackagePath -ForceTargetApplicationShutdown
    Write-Host "Package installed successfully..."
} else {
    Write-Host "An equal or higher version of the package already exists on the system. Installation skipped..."
}
Remove-Item -Path $LuggageRootPath -Recurse -Force
Write-Host "Installation process complete. Installer exiting in 5 seconds."
Start-Sleep -Seconds 5