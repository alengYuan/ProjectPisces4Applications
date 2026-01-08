import { memo } from 'react'
import { formInput } from './style'
import { useFormInput } from './model'
import { TextField } from 'react-aria-components'
import TextInput from '../TextInput/index.jsx'
import TextLabel from '../TextLabel/index.jsx'

/**
 * @type {React.FC<{
 * value:string,
 * onChange:(value:string)=>void,
 * label:string,
 * }>}
 */
const FormInput = props => {
    const { value, onChange, label } = useFormInput(props)

    return (
        <TextField css={formInput} value={value} onChange={onChange}>
            <TextLabel content={label} />
            <TextInput />
        </TextField>
    )
}

export default memo(FormInput)