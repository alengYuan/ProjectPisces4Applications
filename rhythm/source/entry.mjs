import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, Menu } from 'electron'
import { createApp } from './main/index.mjs'
import { requestDataRootPath } from './main/util/index.mjs'
import { requestLocalStatePath } from './main/service/smtc.mjs'

const isDevMode = 'dev_mode' in process.env

!isDevMode && !app.requestSingleInstanceLock() && app.exit(0)

if (isDevMode) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
}

/**
 * @type {()=>void}
 */
const resetAppJumpList = () => {
    app.setJumpList(null)

    app.clearRecentDocuments()

    app.setUserTasks([])
}

process.once('exit', () => {
    resetAppJumpList()
})

process.on('uncaughtException', (error, origin) => {
    const contingencyIsHit =
        error.message.trimEnd().endsWith('not open') ||
        error.message.trimEnd().endsWith('destroyed')

    console.error(
        '+'.repeat(80),
        '\nUncaught exception:\n',
        error,
        '\n\nOrigin:\n',
        origin,
        '\n',
        ...contingencyIsHit ? ['\n:: Contingency is hit ::\n'] : [],
        '+'.repeat(80),
    )

    if (!contingencyIsHit) {
        resetAppJumpList()

        app.exit(1)
    }
})

process.on('unhandledRejection', (reason, promise) => {
    const contingencyIsHit =
        reason instanceof Error &&
        (reason.message.trimEnd().endsWith('not open') ||
            reason.message.trimEnd().endsWith('destroyed'))

    console.error(
        '+'.repeat(80),
        '\nUnhandled rejection:\n',
        promise,
        '\n\nReason:\n',
        reason,
        '\n',
        ...contingencyIsHit ? ['\n:: Contingency is hit ::\n'] : [],
        '+'.repeat(80),
    )

    if (!contingencyIsHit) {
        resetAppJumpList()

        app.exit(1)
    }
})

if (isDevMode) {
    const devCachePath = join(
        dirname(fileURLToPath(import.meta.url)),
        '../../../cache/electron',
    )

    mkdirSync(devCachePath, { recursive: true })

    app.setPath('userData', devCachePath)
}

if (!isDevMode) {
    const localStatePath = requestLocalStatePath()

    localStatePath && app.setPath('userData', localStatePath)
}

/**
 * @type {boolean}
 */
globalThis.isCoreMode = existsSync(
    join(requestDataRootPath() ?? '', 'cast_off'),
)

if (globalThis.isCoreMode) {
    app.commandLine.appendSwitch('disable-gpu')
    app.commandLine.appendSwitch('in-process-gpu')
    app.commandLine.appendSwitch('single-process')
} else {
    app.commandLine.appendSwitch('disable-renderer-backgrounding')
    app.commandLine.appendSwitch('force_high_performance_gpu')

    app.commandLine.appendSwitch(
        'enable-features',
        'FluentOverlayScrollbar,FluentScrollbar',
    )
}

app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('no-proxy-server')

Menu.setApplicationMenu(null)

app.whenReady().then(async() => {
    await createApp()
})

app.on('window-all-closed', () => {
    process.stdout.write('To be, or not to be, that is the question: ...')
})