import { mkdirSync, readdirSync, rmSync } from 'node:fs'
import { rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { v4 as uuid } from 'uuid'
import {
    setMetadataParserWorkerPool,
    requestMetadataParser,
    clearMetadataParserWorkerPool,
} from './metadataParserManager.mjs'
import { writeFile } from '../util/index.mjs'
export { setMetadataParserWorkerPool, clearMetadataParserWorkerPool }

/**
 * @typedef {{
 * flac:{
 * name:string,
 * size:number,
 * modified:number,
 * title:string,
 * artist:string,
 * album:string,
 * length:number,
 * bit:number,
 * depth:number,
 * sample:number,
 * cover:string,
 * record:string,
 * track:string,
 * year:string,
 * genre:string,
 * artists:string,
 * composer:string,
 * lyricist:string,
 * copyright:string,
 * isrc:string,
 * },
 * mp3:{
 * name:string,
 * size:number,
 * modified:number,
 * title:string,
 * artist:string,
 * album:string,
 * length:number,
 * bit:number,
 * sample:number,
 * cover:string,
 * },
 * }} RecordValue
 */

/**
 * @typedef {'flac'|'mp3'} Format
 */

/**
 * @type {(storage:import("better-sqlite3").Database)=>void}
 */
export const maintainValidTable = storage => {
    /**
     * @type {{[format in Format]:Array<{
     * name:string,
     * type:'NULL'|'INTEGER'|'REAL'|'TEXT'|'BLOB',
     * notnull:0|1,
     * unique:0|1,
     * pk:0|1,
     * }>}}
     */
    const tableRule = {
        flac: [
            {
                name: 'uuid',
                type: 'TEXT',
                notnull: 1,
                unique: 0,
                pk: 1,
            },
            {
                name: 'name',
                type: 'TEXT',
                notnull: 1,
                unique: 1,
                pk: 0,
            },
            {
                name: 'size',
                type: 'INTEGER',
                notnull: 1,
                unique: 0,
                pk: 0,
            },
            {
                name: 'modified',
                type: 'INTEGER',
                notnull: 1,
                unique: 0,
                pk: 0,
            },
            {
                name: 'title',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'artist',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'album',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'length',
                type: 'REAL',
                notnull: 1,
                unique: 0,
                pk: 0,
            },
            {
                name: 'bit',
                type: 'INTEGER',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'depth',
                type: 'INTEGER',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'sample',
                type: 'INTEGER',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'cover',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'record',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'track',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'year',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'genre',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'artists',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'composer',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'lyricist',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'copyright',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'isrc',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
        ],
        mp3: [
            {
                name: 'uuid',
                type: 'TEXT',
                notnull: 1,
                unique: 0,
                pk: 1,
            },
            {
                name: 'name',
                type: 'TEXT',
                notnull: 1,
                unique: 1,
                pk: 0,
            },
            {
                name: 'size',
                type: 'INTEGER',
                notnull: 1,
                unique: 0,
                pk: 0,
            },
            {
                name: 'modified',
                type: 'INTEGER',
                notnull: 1,
                unique: 0,
                pk: 0,
            },
            {
                name: 'title',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'artist',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'album',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'length',
                type: 'REAL',
                notnull: 1,
                unique: 0,
                pk: 0,
            },
            {
                name: 'bit',
                type: 'INTEGER',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'sample',
                type: 'INTEGER',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
            {
                name: 'cover',
                type: 'TEXT',
                notnull: 0,
                unique: 0,
                pk: 0,
            },
        ],
    }

    for (const key of Object.keys(tableRule)) {
        const format =
            /**
             * @type {keyof typeof tableRule}
             */
            // eslint-disable-next-line no-inline-comments, no-extra-parens
            (key)

        storage.exec(`DROP INDEX IF EXISTS index_${format}_album;`)

        try {
            const tableInfo =
                /**
                 * @type {Array<{
                 * name:string,
                 * type:'NULL'|'INTEGER'|'REAL'|'TEXT'|'BLOB',
                 * notnull:0|1,
                 * pk:0|1,
                 * }>}
                 */
                // eslint-disable-next-line no-extra-parens
                (storage.pragma(`table_info('${format}')`))

            const indexList =
                /**
                 * @type {Array<{
                 * name:string,
                 * unique:0|1,
                 * origin:'u'|'pk',
                 * }>}
                 */
                // eslint-disable-next-line no-extra-parens
                (storage.pragma(`index_list('${format}')`))

            /**
             * @type {Array<string>}
             */
            const uniqueList = []

            for (const { name } of indexList.filter(
                ({ name, unique, origin }) =>
                    name.startsWith('sqlite_autoindex_') &&
                    unique &&
                    origin === 'u',
            )) {
                uniqueList.push(
                    /**
                     * @type {[{name:string}]}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (storage.pragma(`index_info('${name}')`))[0].name,
                )
            }

            if (
                tableInfo
                    .map(
                        ({ name, type, notnull, pk }) =>
                            `${name}::${type}::${notnull}::${pk}`,
                    )
                    .join(';;') !==
                    tableRule[format]
                        .map(
                            ({ name, type, notnull, pk }) =>
                                `${name}::${type}::${notnull}::${pk}`,
                        )
                        .join(';;') ||
                uniqueList.toSorted().join(';;') !==
                    tableRule[format]
                        .filter(({ unique }) =>
                            unique)
                        .map(({ name }) =>
                            name)
                        .toSorted()
                        .join(';;')
            ) {
                throw new TypeError('Invalid table.')
            }
        } catch (error) {
            console.error(error)

            storage.exec(`DROP TABLE IF EXISTS ${format};`)

            storage.exec(
                `CREATE TABLE IF NOT EXISTS ${format} (${tableRule[format]
                    .map(
                        ({ name, type, notnull, unique, pk }) =>
                            `${name} ${type}${pk ? ' PRIMARY KEY' : ''}${notnull ? ' NOT NULL' : ''}${pk ? '' : unique ? ' UNIQUE' : ''}`,
                    )
                    .join(',')});`,
            )
        }
    }
}

/**
 * @type {(
 * format:Format,
 * libraryPath:string,
 * storage:import("better-sqlite3").Database,
 * cacheCoverRootPath:string,
 * result:{
 * create:number,
 * update:number,
 * delete:number,
 * },
 * )=>Promise<void>}
 */
export const updateDatabaseByType = async(
    format,
    libraryPath,
    storage,
    cacheCoverRootPath,
    result,
) => {
    if (!libraryPath) {
        storage.exec(`DELETE FROM ${format};`)

        rmSync(join(cacheCoverRootPath, format), {
            force: true,
            recursive: true,
        })

        mkdirSync(join(cacheCoverRootPath, format), {
            recursive: true,
        })
    } else {
        /**
         * @type {Map<string,{
         * size:number,
         * modified:number,
         * }>}
         */
        const toBeComparedEntityMap = new Map()

        await Promise.allSettled(
            (() => {
                try {
                    return readdirSync(libraryPath, {
                        withFileTypes: true,
                    })
                        .filter(
                            dirent =>
                                dirent.isFile() &&
                                dirent.name
                                    .toLocaleLowerCase()
                                    .endsWith(`.${format}`),
                        )
                        .map(async file => {
                            const { size, mtime } = await stat(
                                join(libraryPath, file.name),
                            )

                            toBeComparedEntityMap.set(file.name, {
                                size,
                                modified: Math.floor(mtime.getTime() / 1000),
                            })
                        })
                } catch (error) {
                    console.error(error)

                    return []
                }
            })(),
        )

        /**
         * @type {Array<{
         * name:string,
         * cover:string,
         * }>}
         */
        const toBeDeletedRecordList = []

        /**
         * @type {Array<{
         * data:RecordValue[Format],
         * attachment:{
         * cover?:{
         * name:string,
         * data:Uint8Array,
         * },
         * oldCover:string,
         * },
         * }>}
         */
        const toBeUpdatedRecordList = []

        /**
         * @type {Array<{
         * data:RecordValue[Format]&{uuid:string},
         * attachment:{
         * cover?:{
         * name:string,
         * data:Uint8Array,
         * },
         * },
         * }>}
         */
        const toBeCreatedRecordList = []

        const recordList =
            /**
             * @type {Array<{
             * name:string,
             * size:number,
             * modified:number,
             * cover:string,
             * }>}
             */
            // eslint-disable-next-line no-extra-parens
            (
                storage
                    .prepare(
                        `SELECT name, size, modified, cover FROM ${format}`,
                    )
                    .all()
            )

        await Promise.allSettled(
            recordList.map(async({ name, size, modified, cover }) => {
                if (toBeComparedEntityMap.has(name)) {
                    const {
                        size: toBeComparedSize,
                        modified: toBeComparedModified,
                    } =
                        /**
                         * @type {{
                         * size:number,
                         * modified:number,
                         * }}
                         */
                        // eslint-disable-next-line no-extra-parens
                        (toBeComparedEntityMap.get(name))

                    toBeComparedEntityMap.delete(name)

                    if (
                        size !== toBeComparedSize ||
                        modified !== toBeComparedModified
                    ) {
                        try {
                            const { data, attachment } =
                                await requestMetadataParser(
                                    format,
                                    libraryPath,
                                    name,
                                    toBeComparedSize,
                                    toBeComparedModified,
                                )

                            toBeUpdatedRecordList.push({
                                data,
                                attachment: {
                                    ...attachment,
                                    oldCover: cover,
                                },
                            })
                        } catch (error) {
                            console.error(error)

                            toBeDeletedRecordList.push({
                                name,
                                cover,
                            })
                        }
                    }
                } else {
                    toBeDeletedRecordList.push({ name, cover })
                }
            }),
        )

        await Promise.allSettled(
            toBeComparedEntityMap
                .entries()
                .map(async([name, { size, modified }]) => {
                    try {
                        const { data, attachment } =
                            await requestMetadataParser(
                                format,
                                libraryPath,
                                name,
                                size,
                                modified,
                            )

                        toBeCreatedRecordList.push({
                            data: {
                                ...data,
                                uuid: uuid(),
                            },
                            attachment,
                        })
                    } catch (error) {
                        console.error(error)
                    }
                }),
        )

        /**
         * @type {{[key in 'insert'|'update']:{[format in Format]:Array<import("./type").SubSubKey<RecordValue>|'uuid'>}}}
         */
        const parameterList = {
            insert: {
                flac: [
                    'uuid',
                    'name',
                    'size',
                    'modified',
                    'title',
                    'artist',
                    'album',
                    'length',
                    'bit',
                    'depth',
                    'sample',
                    'cover',
                    'record',
                    'track',
                    'year',
                    'genre',
                    'artists',
                    'composer',
                    'lyricist',
                    'copyright',
                    'isrc',
                ],
                mp3: [
                    'uuid',
                    'name',
                    'size',
                    'modified',
                    'title',
                    'artist',
                    'album',
                    'length',
                    'bit',
                    'sample',
                    'cover',
                ],
            },
            update: {
                flac: [
                    'size',
                    'modified',
                    'title',
                    'artist',
                    'album',
                    'length',
                    'bit',
                    'depth',
                    'sample',
                    'cover',
                    'record',
                    'track',
                    'year',
                    'genre',
                    'artists',
                    'composer',
                    'lyricist',
                    'copyright',
                    'isrc',
                ],
                mp3: [
                    'size',
                    'modified',
                    'title',
                    'artist',
                    'album',
                    'length',
                    'bit',
                    'sample',
                    'cover',
                ],
            },
        }

        mkdirSync(join(cacheCoverRootPath, format), {
            recursive: true,
        })

        const deleteStatement = storage.prepare(
            `DELETE FROM ${format} WHERE name = @name`,
        )

        try {
            storage.transaction(
                /**
                 * @type {(dataList:Array<{
                 * name:string,
                 * }>)=>void}
                 */
                dataList => {
                    for (const data of dataList) {
                        deleteStatement.run(data)
                    }
                },
            )(
                toBeDeletedRecordList.map(({ name }) =>
                    ({
                        name,
                    })),
            )

            result.delete += toBeDeletedRecordList.length

            await Promise.allSettled(
                toBeDeletedRecordList.map(async({ cover }) => {
                    if (cover) {
                        await rm(join(cacheCoverRootPath, format, cover), {
                            force: true,
                            recursive: true,
                        })
                    }
                }),
            )
        } catch (error) {
            console.error(error)
        }

        const updateStatement = storage.prepare(`UPDATE ${format}
SET ${parameterList.update[format]
        .map(parameter =>
            `${parameter} = @${parameter}`)
        .join(', ')}
WHERE name = @name`)

        try {
            storage.transaction(
                /**
                 * @type {(dataList:Array<RecordValue[Format]>)=>void}
                 */
                dataList => {
                    for (const data of dataList) {
                        updateStatement.run(data)
                    }
                },
            )(toBeUpdatedRecordList.map(({ data }) =>
                data))

            result.update += toBeUpdatedRecordList.length

            await Promise.allSettled(
                toBeUpdatedRecordList.map(
                    async({ attachment: { cover, oldCover } }) => {
                        if (cover) {
                            try {
                                await writeFile(
                                    join(
                                        cacheCoverRootPath,
                                        format,
                                        cover.name,
                                    ),
                                    cover.data,
                                )
                            } catch (error) {
                                console.error(error)
                            }
                        } else if (oldCover) {
                            await rm(
                                join(cacheCoverRootPath, format, oldCover),
                                {
                                    force: true,
                                    recursive: true,
                                },
                            )
                        }
                    },
                ),
            )
        } catch (error) {
            console.error(error)
        }

        const insertStatement = storage.prepare(
            `INSERT INTO ${format} VALUES (${parameterList.insert[format]
                .map(parameter =>
                    `@${parameter}`)
                .join(', ')})`,
        )

        try {
            storage.transaction(
                /**
                 * @type {(dataList:Array<RecordValue[Format]&{uuid:string}>)=>void}
                 */
                dataList => {
                    for (const data of dataList) {
                        insertStatement.run(data)
                    }
                },
            )(toBeCreatedRecordList.map(({ data }) =>
                data))

            result.create += toBeCreatedRecordList.length

            await Promise.allSettled(
                toBeCreatedRecordList.map(async({ attachment: { cover } }) => {
                    if (cover) {
                        try {
                            await writeFile(
                                join(cacheCoverRootPath, format, cover.name),
                                cover.data,
                            )
                        } catch (error) {
                            console.error(error)
                        }
                    }
                }),
            )
        } catch (error) {
            console.error(error)
        }
    }

    storage.exec(
        `CREATE INDEX IF NOT EXISTS index_${format}_album ON ${format}(album);`,
    )
}

/**
 * @type {(
 * artistRecordList:Array<string>,
 * ruleArtistSplit:false|string,
 * ruleArtistIdentify:false|{[uuid:string]:{
 * group:string,
 * member:Array<string>,
 * }},
 * )=>{[artist:string]:Array<string>}}
 */
export const buildArtistGroupUnderRule = (
    artistRecordList,
    ruleArtistSplit,
    ruleArtistIdentify,
) => {
    /**
     * @type {Map<string,Set<string>>}
     */
    const relationshipMap = new Map(
        artistRecordList.map(
            artist =>
                /**
                 * @type {[string,Set<string>]}
                 */
                // eslint-disable-next-line no-extra-parens
                ([artist, new Set()]),
        ),
    )

    /**
     * @type {Set<string>}
     */
    const validSplitArtistLabelSet = new Set()

    /**
     * @type {Array<{
     * group:string,
     * member:Array<string>,
     * }>}
     */
    const identifyRuleList = Object.values(ruleArtistIdentify || {})

    if (ruleArtistSplit) {
        for (const artist of artistRecordList) {
            if (artist.includes(ruleArtistSplit)) {
                const memberList = artist
                    .split(ruleArtistSplit)
                    .map(member =>
                        member.trim())

                if (!memberList.includes('')) {
                    const memberSet = new Set(memberList)

                    if (memberSet.size === memberList.length) {
                        validSplitArtistLabelSet.add(artist)

                        identifyRuleList.push({
                            group: artist,
                            member: memberList,
                        })
                    }
                }
            }
        }
    }

    const artistRecordSet = new Set(artistRecordList)

    for (const { group, member: memberList } of identifyRuleList) {
        for (const member of memberList) {
            const parentSet = relationshipMap.get(member) ?? new Set()

            parentSet.add(group)

            if ([...parentSet].some(parent =>
                artistRecordSet.has(parent))) {
                relationshipMap.set(member, parentSet)
            }
        }
    }

    /**
     * @type {{[artist:string]:Array<string>}}
     */
    const artistGroup = {}

    for (const anchor of relationshipMap.keys()) {
        if (validSplitArtistLabelSet.has(anchor)) {
            continue
        }

        /**
         * @type {Array<string>}
         */
        const keywordList = [anchor]

        /**
         * @type {(child:string)=>void}
         */
        const collectKeywords = child => {
            const parentSet = relationshipMap.get(child)
            if (parentSet) {
                for (const parent of parentSet) {
                    if (!keywordList.includes(parent)) {
                        keywordList.push(parent)

                        collectKeywords(parent)
                    }
                }
            }
        }

        collectKeywords(anchor)

        artistGroup[anchor] = keywordList
    }

    return artistGroup
}