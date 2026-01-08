/**
 * @type {(props:{
 * value:string,
 * onChange:(value:string)=>void,
 * label:string,
 * })=>{
 * value:string,
 * onChange:(value:string)=>void,
 * label:string,
 * }}
 */
export const useFormInput = ({ value, onChange, label }) =>
    ({
        value,
        onChange,
        label,
    })