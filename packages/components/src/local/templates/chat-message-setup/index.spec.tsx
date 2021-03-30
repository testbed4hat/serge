/* global it expect */

import React from 'react'
import renderer from 'react-test-renderer'

import ChatMessageSetup from './index'

import { ChatMessagesMock } from '@serge/mocks'

const force = {
  name: 'blue',
  color: '#6699cc',
  icon: ''
}

const createNodeMock = (el: any): HTMLTextAreaElement | null => {
  if (el.type === 'textarea') {
    return document.createElement('textarea')
  }
  return null
}

describe('ChatMessageSetup page:', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <ChatMessageSetup isUmpire={true} chatChannel={ChatMessagesMock} selectedForce={force} selectedRole="CO"/>,
        { createNodeMock }
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
