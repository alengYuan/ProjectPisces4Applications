import { memo } from 'react'
import {
    modalOverlay,
    modal,
    dialog,
    dialogTitle,
    dialogContent,
    contentText,
    actionButtonContainer,
} from './style'
import { useContentDialog } from './model'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import NormalButton from '../NormalButton/index.jsx'

/**
 * @type {React.FC<{
 * isOpen:boolean,
 * title:string,
 * content:string,
 * firstButton:{
 * isDefault?:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * secondButton?:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton?:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * }>}
 */
const ContentDialog = props => {
    const {
        isOpen,
        handleCloseByKeyEscape,
        dialogExpectedWidthMeta,
        title,
        content,
        isBlurred,
        handleActionContainerFocus,
        handleActionContainerBlur,
        firstButton,
        secondButton,
        closeButton,
    } = useContentDialog(props)

    return (
        <ModalOverlay
            css={modalOverlay}
            isOpen={isOpen}
            onOpenChange={handleCloseByKeyEscape}
        >
            <Modal css={modal}>
                <Dialog
                    css={dialog}
                    style={dialogExpectedWidthMeta}
                    role="alertdialog"
                >
                    <Heading css={dialogTitle} slot="title">
                        {title}
                    </Heading>
                    <div css={dialogContent}>
                        <p css={contentText} tabIndex={0}>
                            {content}
                        </p>
                    </div>
                    <div
                        {...(isBlurred
                            ? {
                                className: 'blurred-container',
                            }
                            : {})}
                        css={actionButtonContainer}
                        onFocus={handleActionContainerFocus}
                        onBlur={handleActionContainerBlur}
                    >
                        <NormalButton
                            isDefault={firstButton.isDefault}
                            isFlexible={true}
                            onPress={firstButton.onPress}
                            content={firstButton.content}
                        />
                        {secondButton &&
                            <NormalButton
                                isFlexible={true}
                                onPress={secondButton.onPress}
                                content={secondButton.content}
                            />
                        }
                        {closeButton &&
                            <NormalButton
                                isFlexible={true}
                                onPress={closeButton.onPress}
                                content={closeButton.content}
                            />
                        }
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    )
}

export default memo(ContentDialog)