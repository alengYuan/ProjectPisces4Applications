import os from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'

const workerScriptPath = join(
    dirname(fileURLToPath(import.meta.url)),
    './metadataParserManager.worker.mjs',
)

const workerPoolMaxCount = 12

const workerPoolCount = Math.min(
    Math.max((os.cpus().length || 1) - 2, 1),
    workerPoolMaxCount,
)

let actualWorkerPoolCount = 0

/**
 * @type {Array<Worker>}
 */
const workerPool = []

/**
 * @type {Array<{
 * resolve:(value:{
 * data:import("./index.mjs").RecordValue[import("./index.mjs").Format],
 * attachment:{
 * cover?:{
 * name:string,
 * data:Uint8Array,
 * },
 * },
 * })=>void,
 * reject:(reason?:any)=>void,
 * data:{
 * format:import("./index.mjs").Format,
 * libraryPath:string,
 * name:string,
 * size:number,
 * modified:number,
 * },
 * }>}
 */
const taskQueue = []

/**
 * @type {Array<{
 * worker:Worker,
 * resolve:(value:{
 * data:import("./index.mjs").RecordValue[import("./index.mjs").Format],
 * attachment:{
 * cover?:{
 * name:string,
 * data:Uint8Array,
 * },
 * },
 * })=>void,
 * reject:(reason?:any)=>void,
 * data:{
 * format:import("./index.mjs").Format,
 * libraryPath:string,
 * name:string,
 * size:number,
 * modified:number,
 * },
 * }>}
 */
const jobQueue = []

/**
 * @type {()=>void}
 */
const nextTaskHandler = () => {
    if (
        (workerPool.length || actualWorkerPoolCount < workerPoolCount) &&
        taskQueue.length
    ) {
        const worker =
            workerPool.pop() ??
            (() => {
                actualWorkerPoolCount += 1

                const worker = new Worker(workerScriptPath)

                worker.on(
                    'message',
                    /**
                     * @type {(value:{
                     * ok:boolean,
                     * result:{
                     * data:import("./index.mjs").RecordValue[import("./index.mjs").Format],
                     * attachment:{
                     * cover?:{
                     * name:string,
                     * data:ArrayBuffer,
                     * },
                     * },
                     * },
                     * })=>void}
                     */
                    ({ ok, result }) => {
                        const job = jobQueue.find(job =>
                            job.worker === worker)
                        if (job) {
                            if (ok) {
                                const value = result.attachment.cover
                                    ? {
                                        data: result.data,
                                        attachment: {
                                            cover: {
                                                name: result.attachment.cover
                                                    .name,
                                                data: new Uint8Array(
                                                    result.attachment.cover.data,
                                                ),
                                            },
                                        },
                                    }
                                    : {
                                        data: result.data,
                                        attachment: {},
                                    }

                                job.resolve(value)
                            } else {
                                job.reject(
                                    new Error(
                                        'The file to be parsed is invalid or corrupted.',
                                    ),
                                )
                            }

                            jobQueue.splice(jobQueue.indexOf(job), 1)
                        }

                        workerPool.push(worker)

                        nextTaskHandler()
                    },
                )

                return worker
            })()

        const task = taskQueue.pop()
        if (task) {
            worker.postMessage(task.data)

            jobQueue.push({
                worker,
                ...task,
            })
        }
    }
}

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
 * data:Uint8Array,
 * },
 * },
 * }>}
 */
export const requestMetadataParser = (
    format,
    libraryPath,
    name,
    size,
    modified,
) =>
    new Promise((resolve, reject) => {
        taskQueue.push({
            resolve,
            reject,
            data: { format, libraryPath, name, size, modified },
        })

        nextTaskHandler()
    })

/**
 * @type {()=>void}
 */
export const clearMetadataParserWorkerPool = () => {
    if (taskQueue.length + jobQueue.length) {
        throw new ReferenceError(
            'The worker pool can only be cleared after all tasks are completed.',
        )
    }

    for (;;) {
        const worker = workerPool.pop()
        if (worker) {
            worker.terminate()
        } else {
            break
        }
    }

    actualWorkerPoolCount = 0
}