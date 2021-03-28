/* global it expect */
import L from 'leaflet'

import atlanticCells from '../data/atlantic-cells-short'
import createGridFromGeoJSON, { labelFor } from './create-grid-from-geojson'
import createGrid from './create-grid'
import { SergeHex } from '@serge/custom-types'
// import cellTypesList3 from '../data/cell-types-3-small'

it('Construct grid from very new dataset', () => {
  const cells: any = atlanticCells.features
  expect(cells.length).toEqual(11)
  const grid = createGridFromGeoJSON(atlanticCells, 0.5)
  expect(grid.length).toEqual(11)

  // inspect first one
  const first: SergeHex<{}> = grid[0]
  expect(first.poly.length).toEqual(7)
  expect(first.type).toEqual('sea')
  expect(first.name).toEqual('AK05')
  expect(first.x).toEqual(36)
  expect(first.y).toEqual(4)
  expect(first.centreLatLng.lat).toEqual(49.18550019128978)
  expect(first.centreLatLng.lng).toEqual(-39.8037225992912)

  // ok, check routing
  const fourth: SergeHex<{}> = grid[4]
  expect(fourth.name).toEqual('K43')
  const between = grid.hexesBetween(first, fourth)
  expect(between.length).toEqual(52)
})

it('Generate row/col labels', () => {
  expect(labelFor(0, 0)).toEqual('A01')
  expect(labelFor(1, 1)).toEqual('B02')
  expect(labelFor(27, 35)).toEqual('AB36')
  expect(labelFor(227, 35)).toEqual('HT36')
})

it('Construct grid from legacy dataset', () => {
  const grid = createGrid(L.latLngBounds(L.latLng(70, -30), L.latLng(40, -5)), 30)
  expect(grid.length).toEqual(3672)
})
