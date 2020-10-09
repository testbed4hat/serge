/* global it expect */
import {RouteStep} from '@serge/custom-types'

import routeGetLatestPosition from '../route-get-latest-position'

it('returns current with nothing planned', () => {
  expect(routeGetLatestPosition('A12', undefined)).toEqual('A12')
})

it('returns current with route with no steps', () => {
  const route:Array<RouteStep> = []
  expect(routeGetLatestPosition('A12', route)).toEqual('A12')
})

it('returns current with route with no positions', () => {
  const route:Array<RouteStep> = [ 
    {status: {state: 'bbq'}, turn: 3}, 
    {status: {state: 'bbq'}, turn: 4} 
  ]
  expect(routeGetLatestPosition('A12', route)).toEqual('A12')
})

it('returns current with route with positions', () => {
  const route:Array<RouteStep> = [ 
    {status: {state: 'bbq'}, coords: ['B1', 'B2'], turn: 3}, 
    {status: {state: 'bbq'}, coords: ['C1', 'C2'], turn: 4} 
  ]
  expect(routeGetLatestPosition('A12', route)).toEqual('C2')
})


it('returns current with route with no position for last step', () => {
  const route:Array<RouteStep> = [ 
    {status: {state: 'bbq'}, coords: ['B1', 'B2'], turn: 3}, 
    {status: {state: 'bbq'}, turn: 4} 
  ]
  expect(routeGetLatestPosition('A12', route)).toEqual('B2')
})