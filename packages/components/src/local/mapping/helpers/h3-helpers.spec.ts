import data from '../data/atlantic-cells-short'
import L from 'leaflet'
import { checkIfIJWorks, createGridH3, createIndex, h3polyFromBounds, updateXy } from './h3-helpers'
import { geoToH3, polyfill } from 'h3-js'
import { SergeGrid3, SergeHex3 } from '@serge/custom-types'

const smallBounds = L.latLngBounds(L.latLng(40, -40), L.latLng(65, 0))
const largeBounds = L.latLngBounds(L.latLng(40, -90), L.latLng(65, 10))

it('checks if can produce ij index for large bounds', () => {
  const res = 3
  // outer boundary
  const boundsNum = h3polyFromBounds(largeBounds)

  // set of cells in this area
  const cells = polyfill(boundsNum, res)

  // sort out the centre index
  const centreLoc = largeBounds.getCenter()
  const centreIndex = geoToH3(centreLoc.lat, centreLoc.lng, res)

  // find out if we can do local (i, j) cell addressing
  const canDoIJaddress = checkIfIJWorks(cells, centreIndex)

  expect(canDoIJaddress).toBeFalsy()
})

it('checks if can produce ij index for small bounds', () => {
  const res = 3
  // outer boundary
  const boundsNum = h3polyFromBounds(smallBounds)

  // set of cells in this area
  const cells = polyfill(boundsNum, res)

  // sort out the centre index
  const centreLoc = smallBounds.getCenter()
  const centreIndex = geoToH3(centreLoc.lat, centreLoc.lng, res)

  // find out if we can do local (i, j) cell addressing
  const canDoIJaddress = checkIfIJWorks(cells, centreIndex)
  expect(canDoIJaddress).toBeTruthy()
})

it('generates hex coords', () => {
  const res = 3
  const grid = createGridH3(smallBounds, res, data)
  expect(grid.length).toEqual(604)
  const first = grid[0]
  expect(first.index).toEqual('830652fffffffff')
  expect(first.labelStore.latLon).toEqual('64.85N 38.88W')
  expect(first.labelStore.xy).toEqual('A2')
  expect(first.labelStore.ctr).toEqual('1')
  expect(first.poly.length).toEqual(6)
})

it('generates hex coords for large area', () => {
  const res = 3
  const grid = createGridH3(largeBounds, res, data)
  expect(grid.length).toEqual(1470)
  const first = grid[0]
  expect(first.index).toEqual('830f8efffffffff')
  expect(first.labelStore.latLon).toEqual('64.83N 87.82W')
  expect(first.poly.length).toEqual(6)
  expect(first.labelStore.ctr).toEqual('1')
  expect(first.labelStore.xy).toEqual('A16')
})

it('correctly translates -3,23 to A23', () => {
  const grid: SergeGrid3 = []

  const makeIt = (x: number, y: number): SergeHex3 => {
    return {
      centreLatLng: L.latLng(23, 33),
      index: 'aaa',
      labelStore: {
        xy: '',
        xyVals: [x, y],
        ctr: '0',
        latLon: ''
      },
      poly: [],
      styles: 0
    }
  }
  grid.push(makeIt(0, 2))
  grid.push(makeIt(-4, 5))
  grid.push(makeIt(12, 15))
  const res = updateXy(grid)
  expect(res).toBeTruthy()
  expect(res[0].labelStore.xy).toEqual('N14')
})

it('correctly generate index grid', () => {
  expect(createIndex(1, 1)).toEqual('A1')
  expect(createIndex(2, 1)).toEqual('B1')
  expect(createIndex(2, 2)).toEqual('B2')
  expect(createIndex(25, 32)).toEqual('AA32')
  expect(createIndex(18000, 32)).toEqual('AGEZ32')
})
