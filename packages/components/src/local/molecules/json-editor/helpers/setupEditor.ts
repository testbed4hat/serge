import { RefObject } from 'react'

// @ts-ignore
import JSONEditor from '@json-editor/json-editor'
import { Editor } from '@serge/custom-types'

const setupEditor = (editor: Editor | null, schema: any, ref: RefObject<HTMLDivElement>, jsonEditorConfig?: any): Editor | null => {
  if (editor !== null) {
    editor.destroy()
    editor = null
  }

  const disableCollapse = 'disable_collapse'
  const disableEditJson = 'disable_edit_json'
  const disableProperties = 'disable_properties'
  const disableArrayReOrder = 'disable_array_reorder'
  const disableArrayAdd = 'disable_array_add'
  const disableArrayDelete = 'disable_array_delete'
  const promptBeforeDelete = 'prompt_before_delete'

  if (schema && schema.type) {
    const newEditor = new JSONEditor(ref.current, {
      schema: schema,
      theme: 'bootstrap4',
      [disableCollapse]: true,
      [disableEditJson]: true,
      [disableProperties]: true,
      [promptBeforeDelete]: false,
      [disableArrayReOrder]: jsonEditorConfig.disableArrayReOrder ? jsonEditorConfig.disableArrayReOrder : false,
      [disableArrayAdd]: jsonEditorConfig.disableArrayAdd ? jsonEditorConfig.disableArrayAdd : false,
      [disableArrayDelete]: jsonEditorConfig.disableArrayDelete ? jsonEditorConfig.disableArrayDelete : false
    }) as Editor
    return newEditor
  }

  return null
}

export default setupEditor
