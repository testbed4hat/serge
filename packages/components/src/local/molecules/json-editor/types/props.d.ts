import { MessageCustom, MessageStructure, TemplateBody, TempletCreatorBody } from '@serge/custom-types'
import { React } from 'react'

export default interface Props {
  onChange?: (nextMessage: MessageCustom) => void
  /**
   * handler for any text change
   */
  storeNewValue?: (value: { [property: string]: any }) => void
  /**
   * content of message
   */
  messageContent?: MessageStructure
  /**
   * id for message (used for tracking message read)
   */
  messageId: string
  /**
   * template ID
   */
  template: TemplateBody | TempletCreatorBody
  /**
   * title to display above the form
   */
  title?: string
  cachedName?: string | boolean
  clearCachedName?: React.Dispatch<string>
  saveMessage?: () => void
  confirmCancel?: boolean
  /**
   * whether the form is editable (disable for read-only view)
   */
  disabled?: boolean
  /**
   * persist fields in local storage, restore them on render.
   * This was introduced to overcome rendering issue, but then
   * the underlying issue was fixed.
   */
  saveEditedMessage?: boolean
  /**
   * in read view (disabled) make textarea items tall enough to view all contents
   */
  expandHeight?: boolean
  /** current game time, used for initialising date-time controls */
  gameDate: string
  /** disable/enable Array tools with form */
  disableArrayToolsWithEditor?: boolean
  formClassName?: string
  formId?: string
  viewSaveButton?: boolean
  /**
   *  method to customize template, potentially filling any drop-downs
   */
  customiseTemplate?: { (document: MessageStructure | undefined, schema: Record<string, any>): Record<string, any> }

  /**
   *  modify document prior to rendering in JSON editor
   */
  modifyForEdit?: { (document: Record<string, any>): Record<string, any> }

  /**
   *  modify document prior to being stored
   */
  modifyForSave?: { (document: Record<string, any>): Record<string, any> }

  /**
   *  user has clicked on custom edit button
   */
  editCallback?: {(): void}
}
