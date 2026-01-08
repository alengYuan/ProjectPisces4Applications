import { enableMapSet } from 'immer'
import ReactDOM from 'react-dom/client'

/**
 * @type {()=>{
 * reactApp:{
 * rootRef:HTMLDivElement,
 * DOMRoot:import("react-dom/client").Root,
 * },
 * domLayer:HTMLDivElement,
 * }}
 */
export const initReactApp = () => {
    const domLayer =
        /**
         * @type {HTMLDivElement}
         */
        // eslint-disable-next-line no-extra-parens
        (document.querySelector('#dom'))

    const rootRef = document.createElement('div')

    domLayer.appendChild(rootRef)

    enableMapSet()

    return {
        reactApp: {
            rootRef,
            DOMRoot: ReactDOM.createRoot(rootRef),
        },
        domLayer,
    }
}