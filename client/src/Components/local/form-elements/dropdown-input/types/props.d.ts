import { TemplateBody } from 'src/custom-types'

export default interface PropTypes {
  updateStore: (update: TemplateBody) => void
  selectOptions: TemplateBody[]
  disabled?: boolean
  data: string
  className: string
  placeholder: string
}
