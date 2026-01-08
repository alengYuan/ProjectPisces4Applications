import { useEffect } from 'react'
import { usePageStackIsEmpty, usePopPageStack, useTooltip } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * pageStackIsEmpty:boolean,
 * popPageStack:()=>void,
 * handlePopPageStackTooltip:(isHovering:boolean)=>void,
 * }}
 */
export const useBackButton = () => {
    const { pageStackIsEmpty } = usePageStackIsEmpty()

    const { popPageStack } = usePopPageStack()

    const { onHoverChange: handlePopPageStackTooltip } = useTooltip(
        t({
            en: 'Back',
            zh: '后退',
            ja: '戻る',
        }),
    )

    useEffect(() => {
        addEventListener('navigation::back', popPageStack)

        return () => {
            removeEventListener('navigation::back', popPageStack)
        }
    }, [popPageStack])

    return {
        pageStackIsEmpty,
        popPageStack,
        handlePopPageStackTooltip,
    }
}