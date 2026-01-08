/**
 * @type {(props:React.PropsWithChildren<{
 * icon:string,
 * title:string,
 * description:string,
 * }>)=>{
 * icon:string,
 * title:string,
 * description:string,
 * children:React.ReactNode,
 * }}
 */
export const useSettingsItemPanel = ({
    icon,
    title,
    description,
    children,
}) =>
    ({
        icon,
        title,
        description,
        children,
    })