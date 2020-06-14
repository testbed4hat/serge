import { PerceptionFormData, Postback, SelectedAsset } from '@serge/custom-types'

export default interface PropTypes {
  /**
   * The header text for the form (optional)
   */
  formHeader?: string
  /**
   * The asset of the selected force
   */
  type?: string
  /**
   * The color of the force
   */
  force?: string
  /**
   * All types in this definition are options for a form input
   */
  formData: PerceptionFormData
  /**
   * The channel idea from the client (optional)
   */
  channelID?: string | number
  /**
   * The method for posting messages out of the mapping component
   */
  postBack?: Postback
}
