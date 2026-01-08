/**
 * @type {(props:{
 * labelARIAIsHidden?:boolean,
 * content:string,
 * })=>{
 * labelARIAIsHidden:boolean,
 * content:string,
 * }}
 */
export const useTextLabel = ({ labelARIAIsHidden, content }) =>
    ({
        labelARIAIsHidden: Boolean(labelARIAIsHidden),
        content,
    })