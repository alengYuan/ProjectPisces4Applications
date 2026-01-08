/**
 * @type {(props:{
 * ariaLabel:string,
 * isDisabled:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * onHoverChange:(isHovering:boolean)=>void,
 * type:'filled'|'regular',
 * content:string,
 * })=>{
 * ariaLabel:string,
 * isDisabled:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * onHoverChange:(isHovering:boolean)=>void,
 * type:'filled'|'regular',
 * content:string,
 * }}
 */
export const useControlButton = ({
    ariaLabel,
    isDisabled,
    onPress,
    onHoverChange,
    type,
    content,
}) =>
    ({
        ariaLabel,
        isDisabled,
        onPress,
        onHoverChange,
        type,
        content,
    })