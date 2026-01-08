import { useMemo } from 'react'

/**
 * @type {(props:{
 * text:string,
 * asRemark?:boolean,
 * isLive?:'polite'|'assertive',
 * })=>{
 * isLive?:'polite'|'assertive',
 * text:string,
 * }}
 */
export const useScreenReaderText = ({ text, asRemark, isLive }) => {
    const fullText = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            asRemark ? `(${text})` : text,
        [text, asRemark],
    )

    return {
        isLive,
        text: fullText,
    }
}