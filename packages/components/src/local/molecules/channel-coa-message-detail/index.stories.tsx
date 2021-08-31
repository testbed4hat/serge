import React, { useState } from 'react'
import { Story } from '@storybook/react/types-6-0'

// Import component files
import ChannelCoaMessageDetail from './index'
import RFIPropTypes from './types/props'

import {
  MessageTemplatesMockByKey,
  channelCollaborativeEditing,
  messageDataCollaborativeEditing,
  GameChannels,
  GameMessagesMock
} from '@serge/mocks'
import docs from './README.md'

import { MessageCustom, ForceRole } from '@serge/custom-types'
const wrapper: React.FC = (storyFn: any) => <div style={{ height: '600px' }}>{storyFn()}</div>

export default {
  title: 'local/molecules/ChannelCoaMessageDetail',
  component: ChannelCoaMessageDetail,
  decorators: [wrapper],
  parameters: {
    readme: {
      // Show readme before story
      content: docs
    },
    options: {
      // This story requires addons but other stories in this component do not
      showPanel: true
    }
  },
  argTypes: {
    isUmpire: {
      description: 'Player is from umpire force',
      control: 'boolean'
    },
    isRFIManager: {
      description: 'Player role has RFI Manager attribute',
      control: 'boolean'
    },
    role: {
      description: 'Player Role',
      control: {
        type: 'radio',
        options: [
          'Comms',
          'Logistics'
        ]
      }
    }
  }
}

const Template: Story<RFIPropTypes> = (args) => {
  const { isUmpire, role, message } = args
  const [messageState, setMessageState] = useState<MessageCustom>(message)
  const [roleState, setRoleState] = useState<ForceRole | undefined>(undefined)
  // we wish to update message state for a new story. We do
  // this by tracking the role, since each story has
  // a new role.
  if (role !== roleState) {
    setRoleState(role)
    setMessageState(message)
  }

  return (
    <ChannelCoaMessageDetail
      templates={MessageTemplatesMockByKey}
      message={messageState}
      onChange={(nextMessage): void => setMessageState(nextMessage)}
      role={role}
      isUmpire={isUmpire}
      channel={GameChannels[0]}
    />
  )
}

const role: ForceRole = { forceId: 'umpire', forceName: 'White', roleId: 'game-control', roleName: 'Game Control' }
export const Unallocated = Template.bind({})
Unallocated.args = {
  message: messageDataCollaborativeEditing[0],
  isUmpire: true,
  canCollaborate: true,
  canReleaseMessages: false,
  channel: channelCollaborativeEditing,
  role: role
}

export const CustomMessage = Template.bind({})
CustomMessage.args = {
  message: GameMessagesMock[0] as MessageCustom,
  isUmpire: true,
  canCollaborate: true,
  canReleaseMessages: false,
  channel: channelCollaborativeEditing,
  role: role
}