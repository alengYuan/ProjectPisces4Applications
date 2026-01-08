import { memo } from 'react'
import {
    modalOverlay,
    modal,
    dialog,
    dialogTitle,
    formContainer,
    actionButtonContainer,
} from './style'
import { useFormDialog } from './model'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import NormalButton from '../NormalButton/index.jsx'

/**
 * @type {React.FC<React.PropsWithChildren<{
 * isOpen:boolean,
 * title:string,
 * actionButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * }>>}
 */
const FormDialog = props => {
    const {
        isOpen,
        handleCloseByKeyEscape,
        dialogExpectedWidthMeta,
        title,
        children,
        actionButton,
        closeButton,
    } = useFormDialog(props)

    return (
        <ModalOverlay
            css={modalOverlay}
            isOpen={isOpen}
            onOpenChange={handleCloseByKeyEscape}
        >
            <Modal css={modal}>
                <Dialog css={dialog} style={dialogExpectedWidthMeta}>
                    <Heading css={dialogTitle} slot="title">
                        {title}
                    </Heading>
                    <div css={formContainer}>{children}</div>
                    <div css={actionButtonContainer}>
                        <NormalButton
                            isFlexible={true}
                            onPress={actionButton.onPress}
                            content={actionButton.content}
                        />
                        <NormalButton
                            isFlexible={true}
                            onPress={closeButton.onPress}
                            content={closeButton.content}
                        />
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    )
}

export default memo(FormDialog)