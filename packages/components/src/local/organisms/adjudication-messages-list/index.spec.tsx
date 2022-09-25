/* global it expect */
import React from 'react'
import renderer from 'react-test-renderer'
import { AdjudicationMessagesList } from './index'
import { PLANNING_MESSAGE } from '@serge/config'
import { ChannelPlanning, MessagePlanning } from '@serge/custom-types'
import moment from 'moment-timezone'

import { P9Mock, planningMessageTemplatesMock } from '@serge/mocks'
import { noop } from 'lodash'
import { forceColors } from '@serge/helpers'

const planningChannel = P9Mock.data.channels.channels[0] as ChannelPlanning
const forces = P9Mock.data.forces.forces
const blueForce = forces[1]
const blueRole = blueForce.roles[0]

describe('AdjudicationMessagesList component: ', () => {
  it('renders component correctly', () => {
    moment.tz.setDefault('Etc/UTC')
    const markAllAsRead = (): void => window.alert('Callback on mark all as read')
    const messages: MessagePlanning[] = [{
      messageType: PLANNING_MESSAGE,
      details: {
        channel: 'channel-k63pjit0',
        from: {
          force: 'Red',
          forceColor: '#F00',
          iconURL: 'default_img/umpireDefault.png',
          roleName: 'CO',
          roleId: 'u345'
        },
        messageType: 'Chat',
        timestamp: '2020-10-13T08:52:04.394Z',
        turnNumber: 1
      },
      message: {
        reference: 'Message-1',
        title: 'Message Title',
        startDate: '2020-10-13T08:52:04.394Z',
        endDate: '2020-10-15T08:52:04.394Z'
      },
      _id: '2020-03-25T15:08:47.520Z',
      _rev: '1',
      hasBeenRead: false
    }]

    const tree = renderer
      .create(<AdjudicationMessagesList forces={forces} setSelectedItem={(): any => noop} template={planningMessageTemplatesMock[0]} gameDate={P9Mock.data.overview.gameDate} channel={planningChannel} hideForcesInChannel={false}
        messages={messages} onRead={undefined} forceColors={forceColors(forces)} onUnread={undefined} isUmpire={true} playerRoleId={blueRole.roleId}
        playerForceId={blueForce.uniqid} onMarkAllAsRead={markAllAsRead} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
