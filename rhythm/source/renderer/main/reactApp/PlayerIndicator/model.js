import { useEffect, useMemo, useState } from 'react'
import { useQueueSourceType, useQueueAtIdentification } from '../model'
import {
    emptyTheme,
    requestCoverCardTheme,
    cancelCoverCardTheme,
} from '../../coverCardThemeManager'

/**
 * @type {()=>{
 * playerIndicatorTheme:React.CSSProperties,
 * title:string,
 * artist:string,
 * }}
 */
export const usePlayerIndicator = () => {
    const [currentTrackInformation, setCurrentTrackInformation] = useState(
        /**
         * @type {undefined|{
         * key:string,
         * coverSource:string,
         * title:string,
         * artist:string,
         * }}
         */
        // eslint-disable-next-line no-extra-parens
        (void null),
    )

    const [playerIndicatorThemeMetadata, setPlayerIndicatorThemeMetadata] =
        useState(emptyTheme)

    const { queueSourceType } = useQueueSourceType()

    const { queueAtIdentification } = useQueueAtIdentification()

    const playerIndicatorTheme = useMemo(
        /**
         * @type {()=>React.CSSProperties}
         */
        () =>
            /**
             * @type {React.CSSProperties}
             */
            // eslint-disable-next-line no-extra-parens
            (
                playerIndicatorThemeMetadata.coverObjectURL
                    ? {
                        '--cover-card-image-url': `url("${playerIndicatorThemeMetadata.coverObjectURL}")`,
                        '--cover-card-on-primary-container':
                              playerIndicatorThemeMetadata.colorScheme
                                  .colorOnPrimaryContainer,
                        '--cover-card-primary':
                              playerIndicatorThemeMetadata.colorScheme
                                  .colorPrimary,
                        '--cover-card-on-primary':
                              playerIndicatorThemeMetadata.colorScheme
                                  .colorOnPrimary,
                    }
                    : {}
            ),
        [playerIndicatorThemeMetadata],
    )

    useEffect(() => {
        const abortController = new AbortController()

        // eslint-disable-next-line semi-style
        ;(async() => {
            const currentTrackDetailedInformation = await window[
                'rhythm::main'
            ].getDetailedInformationWithUUID(
                queueSourceType,
                queueAtIdentification,
            )

            !abortController.signal.aborted &&
                setCurrentTrackInformation(
                    currentTrackDetailedInformation
                        ? (() => {
                            const {
                                type,
                                size,
                                modified,
                                title,
                                artist,
                                cover,
                            } = {
                                type: queueSourceType,
                                ...currentTrackDetailedInformation,
                            }

                            return {
                                key: `+${type}::${cover}::${size}-${modified}`,
                                coverSource: `${type}/${cover}`,
                                title,
                                artist,
                            }
                        })()
                        : currentTrackDetailedInformation,
                )
        })()

        return () => {
            abortController.abort()
        }
    }, [queueSourceType, queueAtIdentification])

    useEffect(() => {
        currentTrackInformation
            ? requestCoverCardTheme(
                currentTrackInformation.key,
                currentTrackInformation.coverSource,
                setPlayerIndicatorThemeMetadata,
            )
            : setPlayerIndicatorThemeMetadata(emptyTheme)

        return () => {
            currentTrackInformation &&
                cancelCoverCardTheme(currentTrackInformation.key)
        }
    }, [currentTrackInformation])

    return {
        playerIndicatorTheme,
        title: currentTrackInformation?.title ?? '',
        artist: currentTrackInformation?.artist ?? '',
    }
}