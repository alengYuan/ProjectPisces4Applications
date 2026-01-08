import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const isDevMode = 'dev_mode' in process.env

const releaseSourceRootPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../release/resource/source',
)

const testToolScriptPath = join(
    dirname(fileURLToPath(import.meta.url)),
    'resource/react-scan.js',
)

/**
 * @type {Array<{
 * path:string,
 * content:string,
 * }>}
 */
const toBeInjectedHTMLFileList = []

const placeholder = '<!-- reactApp -->'

for (const file of readdirSync(releaseSourceRootPath, {
    withFileTypes: true,
}).filter(
    dirent =>
        dirent.isFile() && dirent.name.toLocaleLowerCase().endsWith('.html'),
)) {
    const path = join(releaseSourceRootPath, file.name)

    const content = readFileSync(path, { encoding: 'utf8' })

    if (content.includes(placeholder)) {
        toBeInjectedHTMLFileList.push({ path, content })
    }
}

if (toBeInjectedHTMLFileList.length) {
    const testToolScript =
        readFileSync(testToolScriptPath, {
            encoding: 'utf8',
        })
            .replaceAll(
                /(?:^|\r\n|\n)\/\*! Bundled license information:[\s\S]*?\*\//gu,
                '',
            )
            .replaceAll('\r\n', '\n')
            .split('\n')
            .pop() ?? placeholder

    for (const { path, content } of toBeInjectedHTMLFileList) {
        writeFileSync(
            path,
            isDevMode
                ? content
                    .replace(
                        placeholder,
                        `<script>
        window.hideIntro = true
        ${testToolScript.replaceAll('$', '$$$$')}
    </script>`,
                    )
                    .replaceAll('\r\n', '\n')
                    .replaceAll('\n', '\r\n')
                : content.replace(
                    new RegExp(`(?:\r\n|\n)    ${placeholder}`, 'u'),
                    '',
                ),
            { encoding: 'utf8' },
        )
    }
}