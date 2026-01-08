import { join } from 'node:path'
import { parentPort } from 'node:worker_threads'
import { parseFile } from 'music-metadata'

/**
 * @type {(
 * format:import("./index.mjs").Format,
 * libraryPath:string,
 * name:string,
 * size:number,
 * modified:number,
 * )=>Promise<{
 * data:import("./index.mjs").RecordValue[import("./index.mjs").Format],
 * attachment:{
 * cover?:{
 * name:string,
 * data:ArrayBuffer,
 * },
 * },
 * }>}
 */
const parseIntoRecord = async(format, libraryPath, name, size, modified) => {
    const metadata = await parseFile(join(libraryPath, name))

    if (
        metadata.format.codec?.toLocaleLowerCase() !==
        {
            flac: 'flac',
            mp3: 'mpeg 1 layer 3',
        }[format]
    ) {
        throw new TypeError('Mismatched file type.')
    }

    if (
        metadata.format.numberOfChannels !== 2 ||
        typeof metadata.format.sampleRate !== 'number' ||
        metadata.format.sampleRate < 44_100 ||
        metadata.format.sampleRate > 192_000 ||
        typeof metadata.format.duration !== 'number' ||
        metadata.format.duration < 1
    ) {
        throw new TypeError('Invalid file.')
    }

    const picture = metadata.common.picture?.pop()

    /**
     * @type {undefined|{
     * name:string,
     * data:ArrayBuffer,
     * }}
     */
    const cover = picture
        ? {
            name: `${name.substring(0, name.length - format.length)}${
                {
                    'image/avif': 'avif',
                    'image/bmp': 'bmp',
                    'image/jpeg': 'jpg',
                    'image/png': 'png',
                    'image/webp': 'webp',
                }[picture.format.toLocaleLowerCase()] ?? 'jpg'
            }`,
            data:
                  /**
                   * @type {ArrayBuffer}
                   */
                  // eslint-disable-next-line no-extra-parens
                  (picture.data.buffer),
        }
        : void null

    return {
        data: {
            flac: {
                name,
                size,
                modified,
                title: metadata.common.title ?? '',
                artist: (metadata.common.artist ?? '').trim(),
                album: (metadata.common.album ?? '').trim(),
                length: metadata.format.duration,
                bit: Math.floor((metadata.format.bitrate ?? 0) / 1000),
                depth: metadata.format.bitsPerSample ?? 0,
                sample: metadata.format.sampleRate ?? 0,
                cover: cover?.name ?? '',
                record:
                    metadata.common.disk.no === null ||
                    metadata.common.disk.of === null
                        ? ''
                        : `${metadata.common.disk.no}/${metadata.common.disk.of}`,
                track:
                    metadata.common.track.no === null ||
                    metadata.common.track.of === null
                        ? ''
                        : `${metadata.common.track.no}/${metadata.common.track.of}`,
                year: String(metadata.common.year ?? ''),
                genre:
                    metadata.common.genre instanceof Array
                        ? metadata.common.genre.join(', ')
                        : '',
                artists: metadata.common.albumartist ?? '',
                composer:
                    metadata.common.composer instanceof Array
                        ? metadata.common.composer.join(', ')
                        : '',
                lyricist:
                    metadata.common.lyricist instanceof Array
                        ? metadata.common.lyricist.join(', ')
                        : '',
                copyright: metadata.common.copyright ?? '',
                isrc:
                    metadata.common.isrc instanceof Array
                        ? metadata.common.isrc.join(', ')
                        : '',
            },
            mp3: {
                name,
                size,
                modified,
                title: metadata.common.title ?? '',
                artist: (metadata.common.artist ?? '').trim(),
                album: (metadata.common.album ?? '').trim(),
                length: metadata.format.duration,
                bit: Math.floor((metadata.format.bitrate ?? 0) / 1000),
                sample: metadata.format.sampleRate ?? 0,
                cover: cover?.name ?? '',
            },
        }[format],
        attachment: { cover },
    }
}

parentPort?.on(
    'message',
    /**
     * @type {(value:{
     * format:import("./index.mjs").Format,
     * libraryPath:string,
     * name:string,
     * size:number,
     * modified:number,
     * })=>Promise<void>}
     */
    async({ format, libraryPath, name, size, modified }) => {
        try {
            const result = await parseIntoRecord(
                format,
                libraryPath,
                name,
                size,
                modified,
            )

            if (result.attachment.cover) {
                parentPort?.postMessage(
                    {
                        ok: true,
                        result,
                    },
                    [result.attachment.cover.data],
                )
            } else {
                parentPort?.postMessage({
                    ok: true,
                    result,
                })
            }
        } catch (error) {
            console.error(error)

            parentPort?.postMessage({ ok: false })
        }
    },
)