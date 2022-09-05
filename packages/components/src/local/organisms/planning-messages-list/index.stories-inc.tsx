import { withKnobs } from '@storybook/addon-knobs'
import { Story } from '@storybook/react/types-6-0'
import React, { useState } from 'react'

// Import component files
import { ChannelPlanning, MessagePlanning } from '@serge/custom-types'
import { mostRecentPlanningOnly } from '@serge/helpers'
import { p9wargame, planningMessages } from '@serge/mocks'
import PlanningMessagesList from './index'
import docs from './README.md'
import MessageListPropTypes from './types/props'

const planningChannel = p9wargame.data.channels.channels[0] as ChannelPlanning
const wrapper: React.FC = (storyFn: any) => <div style={{ height: '600px' }}>{storyFn()}</div>

export default {
  title: 'local/organisms/PlanningMessagesList',
  component: PlanningMessagesList,
  decorators: [withKnobs, wrapper],
  parameters: {
    readme: {
      // Show readme before story
      content: docs
    }
  },
  argTypes: {
    playerForceId: {
      name: 'Player force',
      defaultValue: 'Blue',
      control: {
        type: 'radio',
        options: [
          'White',
          'Blue',
          'Red'
        ]
      }
    }
  }
}

const Template: Story<MessageListPropTypes> = (args) => {
  const { messages, playerForceId, playerRoleId, hideForcesInChannel } = args
  const icons = [
    './images/default_img/forceDefault.png'
  ]
  const colors = [
    '#0F0'
  ]
  const names = [
    'Blue'
  ]
  const [isRead, setIsRead] = useState([true, false])

  const markAllAsRead = (): void => {
    setIsRead(isRead.map(() => true))
  }
  const onRead = (detail: MessagePlanning): void => {
    const newState = isRead.map((state, id) => {
      if (id === messages.findIndex((item: any) => item._id === detail._id)) {
        state = true
      }
      return state
    })
    setIsRead(newState)
  }

  // remove later versions
  const newestMessages = mostRecentPlanningOnly(planningMessages)

  return <PlanningMessagesList
    messages={newestMessages}
    channel={planningChannel}
    icons={icons}
    playerForceId={playerForceId}
    playerRoleId={playerRoleId}
    colors={colors}
    names={names}
    onMarkAllAsRead={markAllAsRead}
    onRead={onRead}
    isUmpire={true}
    hideForcesInChannel={hideForcesInChannel}
  />
}

const blueForce = p9wargame.data.forces.forces[0]
const blueRole = blueForce.roles[1]

export const Default = Template.bind({})
Default.args = {
  messages: [],
  playerForceId: blueForce.uniqid,
  playerRoleId: blueRole.roleId,
  hideForcesInChannel: true
}