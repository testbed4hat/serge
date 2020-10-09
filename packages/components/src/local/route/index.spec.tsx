/* global it expect */
import React from 'react'
import { mount } from 'enzyme'

import Mapping from '../mapping'
import { Phase } from '@serge/config'
import { Route } from './'

import { forces, platformTypes } from '@serge/mocks'
import { RouteStore, Route as RouteType } from '@serge/custom-types'
import { routeCreateStore } from '@serge/helpers'

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

const store: RouteStore = routeCreateStore(undefined, forces, 'Blue', false, platformTypes, undefined, false, false)
const route: RouteType = store.routes[0] as RouteType

const clearFromTurn = (turn: number): void => {
  console.log('clear after turn handler', turn)
}

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
    turnNumber={2}
  >
    <Route name={'alpha'} route={route}
      trimmed={false} color={'#f00'} selected={true} clearRouteHandler = { clearFromTurn } />
  </Mapping>, { attachTo: div })

  expect(tree).toMatchSnapshot()
})