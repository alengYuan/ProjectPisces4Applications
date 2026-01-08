import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const configDirectoryPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../config',
)

const infoConfigPath = join(configDirectoryPath, 'info.json')

const pathConfigPath = join(configDirectoryPath, 'path.json')

const certificatePVKPath = join(configDirectoryPath, 'certificate4test.pvk')

const certificateCerPath = join(configDirectoryPath, 'certificate4test.cer')

const certificatePFXPath = join(configDirectoryPath, 'certificate4test.pfx')

if (
    !(
        existsSync(infoConfigPath) &&
        statSync(infoConfigPath).isFile() &&
        existsSync(pathConfigPath) &&
        statSync(pathConfigPath).isFile()
    )
) {
    console.error(new Error('Run `batch\\pre` first.'))

    process.exit(1)
}

const infoConfig = JSON.parse(
    readFileSync(infoConfigPath, { encoding: 'utf8' }),
)

const pathConfig = JSON.parse(
    readFileSync(pathConfigPath, { encoding: 'utf8' }),
)

if (
    !(
        infoConfig instanceof Object &&
        'publisher' in infoConfig &&
        typeof infoConfig.publisher === 'string' &&
        infoConfig.publisher.trim() &&
        'pfxPassword' in infoConfig &&
        typeof infoConfig.pfxPassword === 'string' &&
        infoConfig.pfxPassword.trim() &&
        pathConfig instanceof Object &&
        'MakeCert.exe' in pathConfig &&
        typeof pathConfig['MakeCert.exe'] === 'string' &&
        pathConfig['MakeCert.exe'].trim() &&
        'pvk2pfx.exe' in pathConfig &&
        typeof pathConfig['pvk2pfx.exe'] === 'string' &&
        pathConfig['pvk2pfx.exe'].trim()
    )
) {
    console.error(
        new Error('Configure `config/info.json` and `config/path.json` first.'),
    )

    process.exit(1)
}

rmSync(certificatePVKPath, { force: true })

rmSync(certificateCerPath, { force: true })

rmSync(certificatePFXPath, { force: true })

{
    const result = spawnSync(
        pathConfig['MakeCert.exe'],
        [
            '-pe',
            '-n',
            `CN=${infoConfig.publisher}`,
            '-sv',
            certificatePVKPath,
            '-a',
            'sha256',
            '-sky',
            'signature',
            '-cy',
            'end',
            '-m',
            '3',
            '-h',
            '0',
            '-len',
            '2048',
            '-r',
            '-eku',
            '1.3.6.1.5.5.7.3.3',
            certificateCerPath,
        ],
        { stdio: 'inherit' },
    )
    if (result.error || result.status !== 0) {
        console.error(new Error('Failed to run `MakeCert.exe`.'))

        process.exit(1)
    }
}

{
    const result = spawnSync(
        pathConfig['pvk2pfx.exe'],
        [
            '-pvk',
            certificatePVKPath,
            '-spc',
            certificateCerPath,
            '-pfx',
            certificatePFXPath,
            '-po',
            infoConfig.pfxPassword,
            '-f',
        ],
        { stdio: 'inherit' },
    )
    if (result.error || result.status !== 0) {
        console.error(new Error('Failed to run `pvk2pfx.exe`.'))

        process.exit(1)
    }
}