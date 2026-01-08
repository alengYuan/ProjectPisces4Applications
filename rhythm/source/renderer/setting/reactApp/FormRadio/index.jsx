import { memo } from 'react'
import { formRadio, radioListContainer } from './style'
import { useFormRadio } from './model'
import { ListBox } from 'react-aria-components'
import TextLabel from '../TextLabel/index.jsx'
import TextRadio from '../TextRadio/index.jsx'

/**
 * @type {React.FC<{
 * value:string,
 * backupValue:string,
 * onChange:(value:string)=>void,
 * label:string,
 * candidateList:Array<[key:string,value:string]>,
 * }>}
 */
const FormRadio = props => {
    const { selectedKeys, onSelectionChange, label, candidateList } =
        useFormRadio(props)

    return (
        <div css={formRadio}>
            <TextLabel labelARIAIsHidden={true} content={label} />
            <ListBox
                css={radioListContainer}
                aria-label={label}
                shouldSelectOnPressUp={true}
                escapeKeyBehavior="none"
                shouldFocusWrap={true}
                selectionMode="single"
                disallowEmptySelection={true}
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
            >
                {candidateList.map(([id, content]) =>

                    <TextRadio
                        key={`${id}::${content}`}
                        id={id}
                        content={content}
                    />)}
            </ListBox>
        </div>
    )
}

export default memo(FormRadio)