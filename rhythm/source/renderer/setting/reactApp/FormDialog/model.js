import { useCallback, useEffect, useMemo } from 'react'

/**
 * @type {(props:React.PropsWithChildren<{
 * isOpen:boolean,
 * title:string,
 * actionButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * }>)=>{
 * isOpen:boolean,
 * handleCloseByKeyEscape:(isOpen:boolean)=>void,
 * dialogExpectedWidthMeta:React.CSSProperties,
 * title:string,
 * children:React.ReactNode,
 * actionButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * }}
 */
export const useFormDialog = ({
    isOpen,
    title,
    actionButton,
    closeButton,
    children,
}) => {
    const dialogExpectedWidthMeta = useMemo(
        /**
         * @type {()=>React.CSSProperties}
         */
        () => {
            let meta =
                /**
                 * @type {React.CSSProperties}
                 */
                // eslint-disable-next-line no-extra-parens
                ({
                    '--dialog-expected-width': 0,
                })

            const offscreenCanvasContext = new OffscreenCanvas(1, 1).getContext(
                '2d',
                {
                    alpha: true,
                },
            )
            if (offscreenCanvasContext) {
                offscreenCanvasContext.imageSmoothingEnabled = true

                offscreenCanvasContext.font = `14px ${
                    getComputedStyle(document.body).fontFamily
                }`

                const textMaxWidth = Math.max(
                    offscreenCanvasContext.measureText(actionButton.content)
                        .width,
                    offscreenCanvasContext.measureText(closeButton.content)
                        .width,
                )

                meta =
                    /**
                     * @type {React.CSSProperties}
                     */
                    // eslint-disable-next-line no-extra-parens
                    ({
                        '--dialog-expected-width': `${
                            Math.ceil((textMaxWidth + (12 + 1) * 2) * 2) +
                            8 +
                            24 * 2
                        }px`,
                    })
            }

            return meta
        },
        [actionButton, closeButton],
    )

    const handleCloseByKeyEscape = useCallback(
        /**
         * @type {(isOpen:boolean)=>void}
         */
        isOpen => {
            if (!isOpen) {
                closeButton.onPress({
                    type: 'press',
                    pointerType: 'virtual',
                    target: document.body,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false,
                    altKey: false,
                    x: NaN,
                    y: NaN,
                    continuePropagation: () =>
                        void null,
                })
            }
        },
        [closeButton],
    )

    useEffect(() => {
        if (isOpen) {
            dispatchEvent(new Event('request-assist-embedded-dialog'))

            return () => {
                dispatchEvent(new Event('cancel-assist-embedded-dialog'))
            }
        }

        return void null
    }, [isOpen])

    return {
        isOpen,
        handleCloseByKeyEscape,
        dialogExpectedWidthMeta,
        title,
        children,
        actionButton,
        closeButton,
    }
}