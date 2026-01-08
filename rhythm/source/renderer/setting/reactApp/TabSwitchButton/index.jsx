import { memo } from 'react'
import { useTabSwitchButton } from './model'

/**
 * @type {React.FC<React.PropsWithChildren<{
 * id:string,
 * css:import("@emotion/serialize").Interpolation<import("@emotion/react").Theme>,
 * tabIndex:number,
 * 'aria-selected':boolean,
 * 'aria-controls':string,
 * 'data-page-key':string,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * }>>}
 */
const TabSwitchButton = props => {
    const {
        reactARIAProps,
        restProps,
        buttonRef,
        id,
        tabIndex,
        ariaSelected,
        ariaControls,
        reactARIAPseudoClassesDataset,
        dataPageKey,
        children,
    } = useTabSwitchButton(props)

    return (
        <button
            {...reactARIAProps}
            {...restProps}
            ref={buttonRef}
            id={id}
            tabIndex={tabIndex}
            role="tab"
            aria-selected={ariaSelected}
            aria-controls={ariaControls}
            {...reactARIAPseudoClassesDataset}
            data-page-key={dataPageKey}
        >
            {children}
        </button>
    )
}

export default memo(TabSwitchButton)