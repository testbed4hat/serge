import { CUSTOM_MESSAGE } from 'src/config'
import { ChannelPlanning, ForceData, MessageCustom, MessageDetails, MessageStructure, PlanningMessageStructure, TemplateBody } from 'src/custom-types'
import { } from 'src/mocks'
import { Story } from '@storybook/react/types-6-0'
import moment from 'moment'
import React from 'react'
import { generateAllTemplates } from '../../molecules/json-editor/helpers/generate-p9-templates'
import NewMessage from './index'
import docs from './README.md'

const wrapper: React.FC = (storyFn: any) => <div style={{ height: '700px' }}>{storyFn()}</div>

export default {
  title: 'local/form-elements/DynamicNewMessage',
  component: NewMessage,
  decorators: [wrapper],
  parameters: {
    readme: {
      content: docs
    },
    options: {
      showPanel: true
    },
    controls: {
      expanded: true
    }
  },
  argTypes: {
    privateMessage: {
      description: 'Provide private message (umpire force)',
      control: {
        type: 'boolean'
      }
    },
    orderableChannel: {
      description: 'Whether messages are shown in order',
      control: {
        type: 'boolean'
      }
    },
    confirmCancel: {
      description: 'Whether player has to confirm cancelling a message',
      control: {
        type: 'boolean'
      }
    }
  }
}

interface StoryPropTypes {
  privateMessage: boolean
  orderableChannel: boolean
  confirmCancel: boolean
  templates: TemplateBody[]
  draftMessage: MessageCustom
}

const fixDate = (element: any, gameDate: string): any => {
  if (element && element.options && element.options.flatpickr) {
    element.options.flatpickr.defaultDate = gameDate
    element.options.flatpickr.dateFormat = 'M dHi\\Z'
  }
  return element
}

const localCustomiseTemplate = (document: MessageStructure | undefined, schema: Record<string, any>): Record<string, any> => {
  // sort out which orders are currently "live"
  const gameDate = '2024-05-01T00:00:00Z'

  // convert to local
  const localDate = moment.utc(gameDate).toLocaleString()
  // check this isn't an adjudication message, since we only
  // set the default dates, if this is a planning message
  const schemaTitle: string = schema.title || 'unknown'
  if (!schemaTitle.startsWith('Adjudicat')) {
    fixDate(schema.properties.startDate, localDate)
    fixDate(schema.properties.endDate, localDate)
  }

  // game dates
  if (document) {
    const plan = document as PlanningMessageStructure
    const startVal = plan.startDate && plan.startDate.length > 0 ? plan.startDate : gameDate
    const endVal = plan.endDate && plan.endDate.length > 0 ? plan.endDate : gameDate
    plan.startDate = moment.utc(startVal).toLocaleString()
    plan.endDate = moment.utc(endVal).toLocaleString()
  }

  return schema
}

const Template: Story<StoryPropTypes> = (args) => {
  const { privateMessage, orderableChannel, confirmCancel, ...props } = args

  const postBack = (details: MessageDetails, message: any): void => {
    console.log('send message', details, message)
    // fix message
  }

  return (<NewMessage
    gameDate={'some date'}
    privateMessage={privateMessage}
    orderableChannel={orderableChannel}
    channel={{} as ChannelPlanning}
    customiseTemplate={localCustomiseTemplate}
    confirmCancel={confirmCancel}
    currentTurn={0}
    selectedForce={{} as ForceData}
    selectedRole={'role-1'}
    selectedRoleName={'role-name'}
    postBack={postBack}
    {...props}
  />)
}

const data = generateAllTemplates()
console.log('generated', data.activities, data.templates)
const templates = data.templates

export const P9Dynamic = Template.bind({})
P9Dynamic.args = {
  templates: templates
}

const cyberTemplate = templates.filter((template) => template._id === 'Cyber--Effects')
export const CyberOpen = Template.bind({})
CyberOpen.args = {
  templates: cyberTemplate || [],
  draftMessage: { messageType: CUSTOM_MESSAGE, details: { messageType: 'Cyber--Effects' } } as MessageCustom
}

const strikeTemplate = 'f-blue--Maritime--MissileStrike'
const strikeTemplates = templates.filter((template) => template._id === strikeTemplate)
export const StrikeOpen = Template.bind({})
StrikeOpen.args = {
  templates: strikeTemplates || [],
  draftMessage: { messageType: CUSTOM_MESSAGE, details: { messageType: strikeTemplate } } as MessageCustom
}

// if (marIstarTemplate) {
//   const fields = marIstarTemplate.details.properties
//   const fieldArr = Object.values(fields)
//   console.table(fieldArr.map((field: any) => {
//     return {
//       title: field.title,
//       order: field.propertyOrder,
//       cols: field.options ? field.options.grid_columns : 'n/a'
//     }
//   }))
// }
