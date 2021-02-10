import { WargameOverview } from '@serge/custom-types'

export default interface PropTypes {
  overview: WargameOverview
  onChange: (nextOverview: WargameOverview) => void
  onSave: (overview: WargameOverview) => void
}

export { WargameOverview } from '@serge/custom-types'