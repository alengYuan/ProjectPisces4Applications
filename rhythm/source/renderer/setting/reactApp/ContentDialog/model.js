import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * @type {(props:{
 * isOpen:boolean,
 * title:string,
 * content:string,
 * firstButton:{
 * isDefault?:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * secondButton?:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton?:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * })=>{
 * isOpen:boolean,
 * handleCloseByKeyEscape:(isOpen:boolean)=>void,
 * dialogExpectedWidthMeta:React.CSSProperties,
 * title:string,
 * content:string,
 * isBlurred:boolean,
 * handleActionContainerFocus:React.FocusEventHandler,
 * handleActionContainerBlur:React.FocusEventHandler,
 * firstButton:{
 * isDefault?:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * secondButton?:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton?:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * }}
 */
export const useContentDialog = ({
    isOpen,
    title,
    content,
    firstButton,
    secondButton,
    closeButton,
}) => {
    const [isBlurred, setIsBlurred] = useState(false)

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

                let textMaxWidth = offscreenCanvasContext.measureText(
                    firstButton.content,
                ).width

                let buttonCount = 1

                if (secondButton) {
                    textMaxWidth = Math.max(
                        offscreenCanvasContext.measureText(secondButton.content)
                            .width,
                        textMaxWidth,
                    )

                    buttonCount += 1
                }

                if (closeButton) {
                    textMaxWidth = Math.max(
                        offscreenCanvasContext.measureText(closeButton.content)
                            .width,
                        textMaxWidth,
                    )

                    buttonCount += 1
                }

                meta =
                    /**
                     * @type {React.CSSProperties}
                     */
                    // eslint-disable-next-line no-extra-parens
                    ({
                        '--dialog-expected-width': `${
                            Math.ceil(
                                (textMaxWidth + (12 + 1) * 2) * buttonCount,
                            ) +
                            8 * (buttonCount - 1) +
                            24 * 2
                        }px`,
                    })
            }

            return meta
        },
        [firstButton, secondButton, closeButton],
    )

    const handleCloseByKeyEscape = useCallback(
        /**
         * @type {(isOpen:boolean)=>void}
         */
        isOpen => {
            if (!isOpen) {
                closeButton?.onPress({
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

    const handleActionContainerFocus = useCallback(
        /**
         * @type {React.FocusEventHandler}
         */
        event => {
            setIsBlurred(event.target === event.currentTarget)
        },
        [],
    )

    const handleActionContainerBlur = useCallback(
        /**
         * @type {React.FocusEventHandler}
         */
        event => {
            if (event.relatedTarget) {
                setIsBlurred(!event.currentTarget.contains(event.relatedTarget))
            } else if (event.target === event.currentTarget.firstChild) {
                setIsBlurred(true)
            }
        },
        [],
    )

    useEffect(() => {
        if (isOpen) {
            dispatchEvent(new Event('request-assist-embedded-dialog'))

            setIsBlurred(true)

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
        content,
        isBlurred,
        handleActionContainerFocus,
        handleActionContainerBlur,
        firstButton,
        secondButton,
        closeButton,
    }
}