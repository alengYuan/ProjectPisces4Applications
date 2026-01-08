/**
 * @type {(props:{
 * ariaLabel:string,
 * isSelected:boolean,
 * onChange:(isSelected:boolean)=>void,
 * status:string,
 * })=>{
 * ariaLabel:string,
 * isSelected:boolean,
 * onChange:(isSelected:boolean)=>void,
 * status:string,
 * }}
 */
export const useSettingsSwitch = ({
    ariaLabel,
    isSelected,
    onChange,
    status,
}) =>
    ({
        ariaLabel,
        isSelected,
        onChange,
        status,
    })