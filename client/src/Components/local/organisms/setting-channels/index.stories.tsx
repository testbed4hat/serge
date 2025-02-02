import React, { useState } from 'react'
// Import component files
import { MessageTemplatesMock, watuWargame } from 'src/mocks'

import { StoryFn } from '@storybook/react'
import SettingChannels from './index'
import docs from './README.md'
import { ChannelTypes } from './types/props'

const wrapper: React.FC = (storyFn: any) => <div style={{ height: '600px' }}>{storyFn()}</div>

const wChannels = watuWargame.data.channels.channels
const wForces = watuWargame.data.forces.forces

const legacyChannel = {
  name: 'Legacy channel',
  uniqid: 'dummy-legacy'
}
const withLegacy = wChannels.concat(legacyChannel as any)

export default {
  title: 'local/organisms/SettingChannels',
  component: SettingChannels,
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
  }
}

const Template: StoryFn = (args) => {
  // the channels child element may theoretically be undefined, we
  // make the compiler happy
  if (args.channels === undefined) {
    return <div />
  }
  const [localChannels, setLocalChannels] = useState<ChannelTypes[]>(args.channels)
  const [selectedChannel, setSelectedChannel] = useState<ChannelTypes>(args.channels[0])

  const handleChangeChannels = (updates: { channels: Array<ChannelTypes>, selectedChannel: ChannelTypes }): void => {
    console.log('handleChangeChannels: ', updates)
    const savedChannelIdx = localChannels.findIndex(c => c.uniqid === updates.selectedChannel.uniqid)
    if (savedChannelIdx !== -1) {
      localChannels[savedChannelIdx] = updates.selectedChannel
      setLocalChannels(localChannels)
    }
  }

  const handleOnSave = (updates: ChannelTypes): void => {
    console.log('handleOnSave: ', updates)
  }

  const onSidebarClick = (channel: ChannelTypes): void => {
    console.log('onSidebarClick: ', channel)
    setSelectedChannel(channel)
  }

  const handleCreate = (): void => {
    console.log('=> handleCreate: ')
  }

  return <SettingChannels
    onCreate={handleCreate}
    onChange={handleChangeChannels}
    onSave={handleOnSave}
    onSidebarClick={onSidebarClick}
    channels={localChannels}
    forces={wForces}
    messageTemplates={MessageTemplatesMock}
    selectedChannel={selectedChannel}
  />
}

export const Default = Template.bind({})
Default.args = {
  channels: wChannels
}

export const WithLegacy = Template.bind({})
WithLegacy.args = {
  channels: withLegacy
}
