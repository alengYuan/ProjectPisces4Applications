import { useCallback, useState } from 'react'

/**
 * @type {(props:React.PropsWithChildren<{
 * isExpanded:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * icon:string,
 * title:string,
 * description:string,
 * status:string,
 * }>)=>{
 * isExpanded:boolean,
 * showDescriptionARIA:()=>void,
 * hideDescriptionARIA:()=>void,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * icon:string,
 * title:string,
 * descriptionARIAIsHidden:boolean,
 * description:string,
 * status:string,
 * children:React.ReactNode,
 * }}
 */
export const useSettingsItemCollapsiblePanel = ({
    isExpanded,
    onPress,
    icon,
    title,
    description,
    status,
    children,
}) => {
    const [descriptionARIAIsHidden, setDescriptionARIAIsHidden] = useState(true)

    const showDescriptionARIA = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setDescriptionARIAIsHidden(false)
        },
        [],
    )

    const hideDescriptionARIA = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setDescriptionARIAIsHidden(true)
        },
        [],
    )

    return {
        isExpanded,
        showDescriptionARIA,
        hideDescriptionARIA,
        onPress,
        icon,
        title,
        descriptionARIAIsHidden,
        description,
        status,
        children,
    }
}