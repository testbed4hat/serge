/* global it expect */

import React from 'react'
import { mount } from 'enzyme'

import Mapping from './index'
import { Phase } from '@serge/config'

/* Import mock data */
import { forces, platformTypes } from '@serge/mocks'

const bounds = {
  imageTop: 14.194809302,
  imageLeft: 42.3558566271,
  imageRight: 43.7417816271,
  imageBottom: 12.401259302
}

const LocalTileLayer = {
  url: '/tiles/{z}/{x}/{y}.png',
  attribution: 'Generated by QTiles'
}

it('Mapping renders correctly', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  // Using enzyme's 'mount' to solve issues with Leaflet requiring access to the DOM and other features not
  // provided by react.render.
  const tree = mount(<Mapping
    tileDiameterMins = {5}
    bounds = {bounds}
    tileLayer = {LocalTileLayer}
    forces = {forces}
    playerForce = 'Blue'
    platforms = {platformTypes}
    phase = {Phase.Planning}
    turnNumber = {4}
  />, { attachTo: div })

  expect(tree).toMatchSnapshot()
})
