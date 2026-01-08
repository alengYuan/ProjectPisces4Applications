import { useCallback } from 'react'

/**
 * @type {()=>{
 * popupInputContextMenu:React.MouseEventHandler<HTMLInputElement>,
 * }}
 */
export const useTextInput = () => {
    const popupInputContextMenu = useCallback(
        /**
         * @type {React.MouseEventHandler<HTMLInputElement>}
         */
        event => {
            if (event.currentTarget.contains(document.activeElement)) {
                event.preventDefault()

                window['rhythm::setting'].popupInputContextMenu(
                    event.clientX,
                    event.clientY,
                    typeof event.currentTarget.selectionStart === 'number' &&
                        typeof event.currentTarget.selectionEnd === 'number' &&
                        Boolean(
                            event.currentTarget.selectionEnd -
                                event.currentTarget.selectionStart,
                        ),
                )
            }
        },
        [],
    )

    return {
        popupInputContextMenu,
    }
}