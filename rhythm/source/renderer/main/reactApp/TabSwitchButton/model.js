import { useMemo, useRef } from 'react'
import { useButton, useFocusRing, useHover, mergeProps } from 'react-aria'

const propsOfUseHover = {}

/**
 * @type {(props:React.PropsWithChildren<{
 * id:string,
 * css:import("@emotion/serialize").Interpolation<import("@emotion/react").Theme>,
 * tabIndex:number,
 * 'aria-selected':boolean,
 * 'aria-controls':string,
 * 'data-type':string,
 * 'data-group-by':string,
 * 'data-group-name':string,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * }>)=>{
 * reactARIAProps:React.ButtonHTMLAttributes<
 * HTMLButtonElement
 * >&React.DOMAttributes<
 * import("@react-types/shared").FocusableElement
 * >,
 * restProps:{
 * css:import("@emotion/serialize").Interpolation<import("@emotion/react").Theme>,
 * },
 * buttonRef:React.MutableRefObject<null|HTMLButtonElement>,
 * id:string,
 * tabIndex:number,
 * ariaSelected:boolean,
 * ariaControls:string,
 * reactARIAPseudoClassesDataset:{
 * 'data-hovered'?:true,
 * 'data-pressed'?:true,
 * 'data-focused'?:true,
 * 'data-focus-visible'?:true,
 * },
 * dataType:string,
 * dataGroupBy:string,
 * dataGroupName:string,
 * children:React.ReactNode,
 * }}
 */
export const useTabSwitchButton = ({
    id,
    tabIndex,
    'aria-selected': ariaSelected,
    'aria-controls': ariaControls,
    'data-type': dataType,
    'data-group-by': dataGroupBy,
    'data-group-name': dataGroupName,
    onPress,
    children,
    ...restProps
}) => {
    const buttonRef = useRef(
        /**
         * @type {null|HTMLButtonElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    const propsOfUseButton = useMemo(() =>
        ({ onPress }), [onPress])

    const { buttonProps, isPressed } = useButton(propsOfUseButton, buttonRef)

    const { focusProps, isFocused, isFocusVisible } = useFocusRing()

    const { hoverProps, isHovered } = useHover(propsOfUseHover)

    const reactARIAProps = useMemo(
        /**
         * @type {()=>React.ButtonHTMLAttributes<
         * HTMLButtonElement
         * >&React.DOMAttributes<
         * import("@react-types/shared").FocusableElement
         * >}
         */
        () =>
            mergeProps(buttonProps, focusProps, hoverProps),
        [buttonProps, focusProps, hoverProps],
    )

    const reactARIAPseudoClassesDataset = useMemo(
        /**
         * @type {()=>{
         * 'data-hovered'?:true,
         * 'data-pressed'?:true,
         * 'data-focused'?:true,
         * 'data-focus-visible'?:true,
         * }}
         */
        () =>
            ({
                ...isHovered ? { 'data-hovered': true } : {},
                ...isPressed ? { 'data-pressed': true } : {},
                ...isFocused ? { 'data-focused': true } : {},
                ...isFocusVisible ? { 'data-focus-visible': true } : {},
            }),
        [isPressed, isFocused, isFocusVisible, isHovered],
    )

    return {
        reactARIAProps,
        restProps,
        buttonRef,
        id,
        tabIndex,
        ariaSelected,
        ariaControls,
        reactARIAPseudoClassesDataset,
        dataType,
        dataGroupBy,
        dataGroupName,
        children,
    }
}