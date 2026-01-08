import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IntersectionObserverSetOfThemeUpdateChanceGetContext } from '../LibraryContentContainer/model'
import {
    emptyTheme,
    requestCoverCardTheme,
    cancelCoverCardTheme,
} from '../../coverCardThemeManager'

/**
 * @type {(props:{
 * index:number,
 * themeCache:undefined|{
 * coverObjectURL:string,
 * colorScheme:{
 * colorOnPrimaryContainer:string,
 * colorPrimary:string,
 * colorOnPrimary:string,
 * },
 * },
 * type:'flac'|'mp3',
 * uuid:string,
 * size:number,
 * modified:number,
 * title:string,
 * artist:string,
 * depth?:number,
 * sample:number,
 * cover:string,
 * })=>{
 * coverCardContainerRef:React.MutableRefObject<null|HTMLDivElement>,
 * coverCardTheme:React.CSSProperties,
 * isHighQuality:boolean,
 * index:number,
 * uuid:string,
 * title:string,
 * artist:string,
 * }}
 */
export const useCoverCard = ({
    index,
    themeCache,
    type,
    uuid,
    size,
    modified,
    title,
    artist,
    depth,
    sample,
    cover,
}) => {
    const coverCardContainerRef = useRef(
        /**
         * @type {null|HTMLDivElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    const intersectionObserverSetOfThemeUpdateChanceGet = useContext(
        IntersectionObserverSetOfThemeUpdateChanceGetContext,
    )

    const [coverCardThemeMetadata, setCoverCardThemeMetadata] = useState(
        themeCache ?? emptyTheme,
    )

    const coverCardTheme = useMemo(
        /**
         * @type {()=>React.CSSProperties}
         */
        () =>
            /**
             * @type {React.CSSProperties}
             */
            // eslint-disable-next-line no-extra-parens
            (
                coverCardThemeMetadata.coverObjectURL
                    ? {
                        '--cover-card-image-url': `url("${coverCardThemeMetadata.coverObjectURL}")`,
                        '--cover-card-on-primary-container':
                              coverCardThemeMetadata.colorScheme
                                  .colorOnPrimaryContainer,
                        '--cover-card-primary':
                              coverCardThemeMetadata.colorScheme.colorPrimary,
                        '--cover-card-on-primary':
                              coverCardThemeMetadata.colorScheme.colorOnPrimary,
                    }
                    : {}
            ),
        [coverCardThemeMetadata],
    )

    const isHighQuality = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            typeof depth === 'number' && depth >= 24 && sample >= 96000,
        [depth, sample],
    )

    useEffect(() => {
        const coverCardThemeHandlerKey = `${type}::${cover}::${size}-${modified}`

        /**
         * @type {()=>void}
         */
        const themeUpdateChanceGetHandler = () => {
            requestCoverCardTheme(
                coverCardThemeHandlerKey,
                `${type}/${cover}`,
                setCoverCardThemeMetadata,
            )
        }

        const coverCardContainer = coverCardContainerRef.current
        if (
            coverCardContainer &&
            intersectionObserverSetOfThemeUpdateChanceGet
        ) {
            coverCardContainer.addEventListener(
                'theme-update-chance-get',
                themeUpdateChanceGetHandler,
            )

            const [intersectionObserverOfThemeUpdateChanceGet] =
                intersectionObserverSetOfThemeUpdateChanceGet

            intersectionObserverOfThemeUpdateChanceGet.observe(
                coverCardContainer,
            )
        }

        return () => {
            if (
                coverCardContainer &&
                intersectionObserverSetOfThemeUpdateChanceGet
            ) {
                const [
                    intersectionObserverOfThemeUpdateChanceGet,
                    timeoutIDMapOfThemeUpdateChanceGet,
                ] = intersectionObserverSetOfThemeUpdateChanceGet

                intersectionObserverOfThemeUpdateChanceGet.unobserve(
                    coverCardContainer,
                )

                const timeoutIDOfThemeUpdateChanceGet =
                    timeoutIDMapOfThemeUpdateChanceGet.get(coverCardContainer)
                if (timeoutIDOfThemeUpdateChanceGet) {
                    timeoutIDMapOfThemeUpdateChanceGet.delete(
                        coverCardContainer,
                    )

                    clearTimeout(timeoutIDOfThemeUpdateChanceGet)
                }

                coverCardContainer.removeEventListener(
                    'theme-update-chance-get',
                    themeUpdateChanceGetHandler,
                )
            }

            cancelCoverCardTheme(coverCardThemeHandlerKey)
        }
    }, [
        type,
        size,
        modified,
        cover,
        intersectionObserverSetOfThemeUpdateChanceGet,
    ])

    return {
        coverCardContainerRef,
        coverCardTheme,
        isHighQuality,
        index,
        uuid,
        title,
        artist,
    }
}