import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express, { static as staticFiles } from 'express'

const appAssetPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../source/asset',
)

const userDataPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../cache/electron',
)

mkdirSync(userDataPath, { recursive: true })

/**
 * @type {undefined|import("node:http").Server}
 */
let server = void null

const app = express()

app.use('/app-asset', staticFiles(appAssetPath))

app.use('/user-data', staticFiles(userDataPath))

app.get('/exit', (_, response) => {
    response.send('Random access stream partner is down.')

    server?.close(() => {
        process.exit(0)
    })
})

server = app.listen(7986)