export const controlWindow = window.rhythm.controlWindow

export const openDevTools = window.rhythm.openDevTools

/**
 * @type {Set<(event:{
 * mode:'light'|'dark',
 * })=>void>}
 */
const themeColorChangeHandlerReferenceSet = new Set()

export const themeColor = {
    /**
     * @type {'light'|'dark'}
     */
    // eslint-disable-next-line accessor-pairs
    get mode() {
        return matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    },
    /**
     * @type {(type:'change',listener:(event:{
     * mode:'light'|'dark',
     * })=>void)=>void}
     */
    addEventListener: (_, listener) => {
        if (!themeColorChangeHandlerReferenceSet.has(listener)) {
            themeColorChangeHandlerReferenceSet.add(listener)
        }
    },
    /**
     * @type {(type:'change',listener:(event:{
     * mode:'light'|'dark',
     * })=>void)=>void}
     */
    removeEventListener: (_, listener) => {
        if (themeColorChangeHandlerReferenceSet.has(listener)) {
            themeColorChangeHandlerReferenceSet.delete(listener)
        }
    },
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    /**
     * @type {'light'|'dark'}
     */
    const themeColor = event.matches ? 'dark' : 'light'

    Promise.all(
        [...themeColorChangeHandlerReferenceSet].map(
            themeColorChangeHandler =>
                new Promise(resolve => {
                    setTimeout(() => {
                        try {
                            themeColorChangeHandler({ mode: themeColor })
                        } catch (error) {
                            console.error(error)
                        } finally {
                            resolve(void null)
                        }
                    })
                }),
        ),
    )
})

/**
 * @type {Set<(event:{
 * rgb:string,
 * })=>void>}
 */
const accentColorChangeHandlerReferenceSet = new Set()

export const accentColor = {
    /**
     * @type {Promise<string>}
     */
    // eslint-disable-next-line accessor-pairs
    get rgb() {
        return window.rhythm.getAccentColor()
    },
    /**
     * @type {(type:'change',listener:(event:{
     * rgb:string,
     * })=>void)=>void}
     */
    addEventListener: (_, listener) => {
        if (!accentColorChangeHandlerReferenceSet.has(listener)) {
            accentColorChangeHandlerReferenceSet.add(listener)
        }
    },
    /**
     * @type {(type:'change',listener:(event:{
     * rgb:string,
     * })=>void)=>void}
     */
    removeEventListener: (_, listener) => {
        if (accentColorChangeHandlerReferenceSet.has(listener)) {
            accentColorChangeHandlerReferenceSet.delete(listener)
        }
    },
}

window.rhythm.updateAccentColor((_, accentColor) => {
    Promise.all(
        [...accentColorChangeHandlerReferenceSet].map(
            accentColorChangeHandler =>
                new Promise(resolve => {
                    setTimeout(() => {
                        try {
                            accentColorChangeHandler({ rgb: accentColor })
                        } catch (error) {
                            console.error(error)
                        } finally {
                            resolve(void null)
                        }
                    })
                }),
        ),
    )
})