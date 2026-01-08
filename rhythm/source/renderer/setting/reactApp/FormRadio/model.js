import { useCallback, useMemo } from 'react'

/**
 * @type {(props:{
 * value:string,
 * backupValue:string,
 * onChange:(value:string)=>void,
 * label:string,
 * candidateList:Array<[key:string,value:string]>,
 * })=>{
 * selectedKeys:Iterable<import("@react-types/shared").Key>,
 * onSelectionChange:(keys:'all'|Set<import("@react-types/shared").Key>)=>void,
 * label:string,
 * candidateList:Array<[key:string,value:string]>,
 * }}
 */
export const useFormRadio = ({
    value,
    backupValue,
    onChange,
    label,
    candidateList,
}) => {
    const selectedKeys = useMemo(
        /**
         * @type {()=>Iterable<import("@react-types/shared").Key>}
         */
        () =>
            [value],
        [value],
    )

    const onSelectionChange = useCallback(
        /**
         * @type {(keys:'all'|Set<import("@react-types/shared").Key>)=>void}
         */
        keys => {
            onChange(
                keys === 'all'
                    ? backupValue
                    : (() => {
                        const firstKey = [...keys][0]

                        return typeof firstKey === 'string' && firstKey
                            ? firstKey
                            : backupValue
                    })(),
            )
        },
        [backupValue, onChange],
    )

    return {
        selectedKeys,
        onSelectionChange,
        label,
        candidateList,
    }
}