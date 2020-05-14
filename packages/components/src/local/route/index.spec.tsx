/* global it expect */
import React from 'react'
import { mount } from 'enzyme'

import Mapping from '../mapping'
import { Phase } from '@serge/config'
import { Route } from './'

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
const greenForce: any = forces[3]
const platform: any = greenForce.assets[0]
const { plannedTurns, history } = platform

it('Mapping renders correctly with Route', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  // Using enzyme's 'mount' to solve issues with Leaflet requiring access to the DOM and other features not
  // provided by react.render.
  const tree = mount(<Mapping
    bounds = {bounds}
    tileLayer = {LocalTileLayer}
    tileDiameterMins={5}
    platforms = {platformTypes}
    forces={forces}
    playerForce={'Blue'}
    phase={Phase.Planning}
  >
    <Route name={'alpha'} location={'J2'} history={history} planned={plannedTurns}
      trimmed={false} color={'#f00'} selected={true} />
  </Mapping>, { attachTo: div })

  expect(tree).toMatchSnapshot()
})
