/**
 * @type {(props:{
 * isDefault?:boolean,
 * isFlexible?:boolean,
 * ariaDescribedBy?:string,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * })=>{
 * isDefault:boolean,
 * isFlexible:boolean,
 * ariaDescribedBy:string,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * }}
 */
export const useNormalButton = ({
    isDefault,
    isFlexible,
    ariaDescribedBy,
    onPress,
    content,
}) =>
    ({
        isDefault: Boolean(isDefault),
        isFlexible: Boolean(isFlexible),
        ariaDescribedBy: ariaDescribedBy ?? '',
        onPress,
        content,
    })