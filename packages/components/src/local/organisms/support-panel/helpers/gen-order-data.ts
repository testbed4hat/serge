import { GeometryType, PLANNING_MESSAGE } from '@serge/config'
import {
  Asset, ForceData, MessageDetails, MessageDetailsFrom, MessagePlanning,
  PerceivedTypes, PlannedActivityGeometry, PlannedProps, PlanningActivity, PlanningActivityGeometry, Role
} from '@serge/custom-types'
import { PlanningMessageStructure } from '@serge/custom-types/message'
import { deepCopy, findPerceivedAsTypes } from '@serge/helpers'
import moment from 'moment-timezone'
import * as turf from '@turf/turf'
import L from 'leaflet'

const sample: MessagePlanning = {
  messageType: PLANNING_MESSAGE,
  details: {
    channel: 'channel-blue-planning',
    from: {
      force: 'Blue',
      forceColor: '#00F',
      roleName: 'Mar-1',
      roleId: 'rk116f5e',
      iconURL: 'default_img/umpireDefault.png'
    },
    messageType: 'Land Activity',
    timestamp: '2022-09-21T13:15:09.106Z',
    turnNumber: 6
  },
  message: {
    reference: 'Blue-12',
    Date: '13/05/2021 16:12',
    Description: 'More land operations',
    Location: 'Region-A',
    Status: 'Minor',
    title: 'Operation Bravo-12',
    Assets: [
      {
        FEName: 'Blue:4',
        Number: 1,
        StartDate: '13/05/2021',
        EndDate: '14/05/2021'
      },
      {
        FEName: 'Blue:13',
        Number: 4,
        StartDate: '13/05/2021',
        EndDate: '14/05/2021'
      }
    ],
    Targets: [
      {
        FEName: 'Red Force:3',
        Number: 4
      }
    ]
  },
  hasBeenRead: false,
  _id: 'idp_3a',
  _rev: '2'
}

interface PerForceData {
  forceId: ForceData['uniqid']
  forceName: ForceData['name']
  forceColor: ForceData['color']
  roles: Role[]
  ownAssets: Asset[]
  otherAssets: Asset[]
  opAsset: PerceivedTypes[]
}

/** an instance of one geometry interacting with another */
export interface PlanningContact {
  id: string
  first: GeomWithOrders
  second: GeomWithOrders
  timeStart: number // unix millis
  timeEnd: number // unix millis
}

/** object that lets us put the parent orders object into
 * a planned geometry
 */
export interface GeomWithOrders extends PlannedActivityGeometry {
  /**
   *  the set of orders this geometry relates to
   */
  activity: MessagePlanning
  /**
   * the force these orders belong to
   */
  force: ForceData['uniqid']
  /**
   * id for this state/activity
   */
  id: string
}

const collateForceData = (forces: ForceData[], createFor: string[]): PerForceData[] => {
  const res: PerForceData[] = createFor.map((forceId: string): PerForceData => {
    const thisForce = forces.find((force: ForceData) => force.uniqid === forceId)
    const opAssets: PerceivedTypes[] = []
    const realOpAssets: Asset[] = []
    forces.forEach((force: ForceData) => {
      if (force.uniqid !== forceId) {
        if (force.assets) {
          force.assets.forEach((asset: Asset) => {
            if (asset.location) {
              const perceivedAsTypes: PerceivedTypes | null = findPerceivedAsTypes(
                forceId,
                asset.name,
                !!(force.visibleTo && force.visibleTo.includes(forceId)),
                asset.contactId,
                force.uniqid,
                asset.platformTypeId,
                asset.perceptions
              )
              if (perceivedAsTypes) {
                opAssets.push(perceivedAsTypes)
                realOpAssets.push(asset)
              }
            }
          })
        }
      }
    })
    return {
      forceId: forceId,
      forceName: (thisForce && thisForce.name) || '',
      forceColor: (thisForce && thisForce.color) || '',
      roles: thisForce ? thisForce.roles : [],
      ownAssets: (thisForce && thisForce.assets) || [],
      opAsset: opAssets,
      otherAssets: realOpAssets
    }
  })
  return res
}

/** return a pseudo random number between 0 and 1 */
const psora = (k: number): number => {
  const m = Math.pow(3 + k, 2)
  const r = Math.PI * m
  const res = r - Math.floor(r)
  return res
}

const randomArrayItem = <Type>(arr: Type[], ctr: number): Type => {
  return arr[Math.floor(arr.length * psora(ctr))]
}

const randomRole = (roles: Role[], ctr: number): Role => {
  return randomArrayItem(roles, ctr) as Role
}

const activityTypes = ['Transit', 'Kinetic', 'Asymmetric']

const locations = ['Point-A', 'Point-B', 'Region-A', 'Region-B', 'Polyline-A', 'Polyline-B']

const flipMe = (point: number[]): number[] => {
  return [point[1], point[0]]
}

const geometryFor = (own: Asset, target: Asset, geometry: PlanningActivityGeometry, seedIn: number, timeStart: string, timeFinish: string): GeoJSON.Feature => {
  const seed = psora(seedIn + 6)
  const dummyLocation = [39.75, -104.994]
  const dateProps: PlannedProps = {
    startDate: timeStart,
    endDate: timeFinish
  }
  switch (geometry.aType) {
    case GeometryType.point: {
      const loc = target.location || dummyLocation
      return {
        type: 'Feature',
        properties: dateProps,
        geometry: {
          type: 'Point',
          coordinates: flipMe(loc)
        }
      }
    }
    case GeometryType.polygon: {
      // calculate the reference of cell immediately behind the origin
      const leafPt = target.location || dummyLocation
      const origin = turf.point([leafPt[1], leafPt[0]])
      const rangeKm = 30 + psora(seed) * 600
      const newTL = turf.destination(origin, rangeKm, 315).geometry.coordinates
      const newBR = turf.destination(origin, rangeKm, 135).geometry.coordinates
      const leafTL = L.latLng(newTL[0], newTL[1])
      const leafBR = L.latLng(newBR[0], newBR[1])
      const coords = [[[leafTL.lat, leafTL.lng], [leafTL.lat, leafBR.lng], [leafBR.lat, leafBR.lng], [leafBR.lat, leafTL.lng], [leafTL.lat, leafTL.lng]]]
      return {
        type: 'Feature',
        properties: dateProps,
        geometry: {
          type: 'Polygon',
          coordinates: coords
        }
      }
    }
    case GeometryType.polyline: {
      const ownPt = own.location || dummyLocation
      const tgtPt = target.location || dummyLocation
      const numBreaks = Math.floor(psora(seed) * 4) + 1
      const deltaLat = (tgtPt[0] - ownPt[0]) / numBreaks
      const deltaLng = (tgtPt[1] - ownPt[1]) / numBreaks
      const path = [flipMe(ownPt)]
      for (let i = 1; i <= numBreaks; i++) {
        const variance = 0.5
        const newPtLat = ownPt[0] + deltaLat * i - variance + psora(seed + i) * 2 * variance
        const newPtLng = ownPt[1] + deltaLng * i - variance + psora(seed - i) * 2 * variance
        const roundedLat = Math.trunc(newPtLat * 100) / 100
        const roundedLng = Math.trunc(newPtLng * 100) / 100
        const pt = [roundedLat, roundedLng]
        path.push(flipMe(pt))
      }
      path.push(flipMe(tgtPt))
      return {
        type: 'Feature',
        properties: dateProps,
        geometry: {
          type: 'LineString',
          coordinates: path
        }
      }
    }
  }
}

/** produce some planned geometries */
export const geometriesFor = (ownAssets: Asset[], targets: Asset[], activity: PlanningActivity, ctr: number, timeNow: moment.Moment): PlannedActivityGeometry[] => {
  const own = randomArrayItem(ownAssets, ctr++)
  const other = randomArrayItem(targets, ctr++)
  const geoms = activity.geometries
  if (geoms) {
    const res: PlannedActivityGeometry[] = geoms.map((plan: PlanningActivityGeometry, index: number): PlannedActivityGeometry => {
      const timeStart = timeNow
      const minsOffset = Math.floor(psora(1 + index * ctr) * 20) * 10
      const timeEnd = timeStart.clone().add(minsOffset, 'm')
      const planned: PlannedActivityGeometry = {
        uniqid: plan.uniqid,
        geometry: geometryFor(own, other, plan, ctr * (1 + index), timeStart.toISOString(), timeEnd.toISOString())
      }
      timeNow = timeEnd
      return planned
    })
    return res
  }
  return []
}

const createMessage = (force: PerForceData, ctr: number, orderTypes: PlanningActivity[], timeNow: moment.Moment): MessagePlanning => {
  // details first
  const from = randomRole(force.roles, 4 + ctr)
  const fromD: MessageDetailsFrom = {
    force: force.forceName,
    forceColor: force.forceColor,
    roleName: from.name,
    roleId: from.roleId,
    iconURL: sample.details.from.iconURL,
    forceId: force.forceId
  }
  const details: MessageDetails = {
    channel: sample.details.channel,
    from: fromD,
    messageType: 'Land Activity',
    timestamp: moment('2022-09-21T13:15:09.106Z').add(psora(ctr + 2) * 200, 'h').toISOString(),
    turnNumber: 3
  }
  // assets
  const numAssets = randomArrayItem([1, 2, 3, 4], ctr + 5)
  const assets: Asset[] = []
  for (let k = 0; k < numAssets; k++) {
    let possAsset = randomArrayItem(force.ownAssets, 1 + k + ctr + 3)
    let ctr2 = ctr
    while (assets.includes(possAsset)) {
      possAsset = randomArrayItem(force.ownAssets, ++ctr2)
    }
    assets.push(possAsset)
  }
  const assetObj = assets.map((asset: Asset, index: number) => {
    const startDate = moment('2022-09-21T00:00:00.000Z').add(psora(index + 2) * 5, 'h').startOf('hour').toISOString()
    return {
      FEName: asset.name,
      Number: Math.floor(psora(index + 2) * 5),
      StartDate: startDate,
      EndDate: moment(startDate).add(Math.floor(psora(ctr + index + 2) * 19), 'h').toISOString()
    }
  })

  const numTargets = randomArrayItem([1, 2, 3], ++ctr * 1.4)
  const targets: PerceivedTypes[] = []
  for (let m = 0; m < numTargets; m++) {
    let possTarget = randomArrayItem(force.opAsset, m + 3)
    let ctr2 = ctr
    while (targets.includes(possTarget)) {
      possTarget = randomArrayItem(force.opAsset, ++ctr2)
    }
    targets.push(possTarget)
  }
  const targetObj = targets.map((per: PerceivedTypes, index: number) => {
    return {
      FEName: per.name,
      Number: 1 + Math.floor(psora(ctr + index))
    }
  })

  const activity = randomArrayItem(activityTypes, ctr - 3)
  const geometries = geometriesFor([randomArrayItem(force.ownAssets, ctr++)], [randomArrayItem(force.otherAssets, ctr++)],
    randomArrayItem(orderTypes, ctr++), 5 * psora(4 * ctr), timeNow)

  // sort out the overall time period
  let startDate: moment.Moment | undefined
  let endDate: moment.Moment | undefined
  geometries.forEach((val: PlannedActivityGeometry) => {
    const props = val.geometry.properties
    if (props) {
      const thisStart = moment(props.startDate)
      const thisEnd = moment(props.endDate)
      if (!startDate || thisStart.isBefore(startDate)) {
        startDate = thisStart.clone()
      }
      if (!endDate || thisEnd.isAfter(endDate)) {
        endDate = thisEnd.clone()
      }
    }
  })

  if (!startDate) {
    const timeStart = timeNow
    const minsOffset = Math.floor(psora(2 * ctr) * 20) * 10
    const timeEnd = timeStart.clone().add(minsOffset, 'm')
    startDate = timeStart
    endDate = timeEnd
  }

  // create the message
  const message: PlanningMessageStructure = {
    reference: force.forceName + '-' + ctr,
    title: 'Order item ' + ctr + ' ' + activity,
    startDate: startDate && startDate.toISOString(),
    endDate: endDate && endDate.toISOString(),
    Description: 'Order description ' + ctr,
    Location: randomArrayItem(locations, ctr + 8),
    location: geometries,
    ActivityType: activity,
    Assets: assetObj,
    Targets: targetObj
  }

  return { ...sample, details: details, message: message, _id: 'm_' + force.forceId + '_' + ctr }
}

export const invertMessages = (messages: MessagePlanning[]): GeomWithOrders[] => {
  const res: GeomWithOrders[] = []
  messages.forEach((message: MessagePlanning) => {
    if (message.message.location) {
      message.message.location.forEach((plan: PlannedActivityGeometry) => {
        const fromBit = message.details.from
        const id = message.message.title + '-' + plan.uniqid + '-' + message._id
        const newItem = { ...plan, activity: message, force: fromBit.forceId || fromBit.force, pState: {}, id: id }
        if (!newItem.geometry.properties) {
          newItem.geometry.properties = {}
        }
        newItem.geometry.properties.name = message.message.title + ' ' + plan.uniqid
        res.push(newItem)
      })
    }
  })
  return res
}

export const randomOrdersDocs = (count: number, forces: ForceData[], createFor: string[], orderTypes: PlanningActivity[]): MessagePlanning[] => {
  const res: MessagePlanning[] = []
  const perForce = collateForceData(forces, createFor)
  let startTime = moment('2022-11-15T00:00:00.000Z')
  for (let i = 0; i < count; i++) {
    const willIncrement = psora(2 + i) > 0.7
    const minsOffset = willIncrement ? Math.floor(psora(1 + i) * 4) * 5 : 0
    startTime = startTime.add(minsOffset, 'm')
    const authorForce: PerForceData = randomArrayItem(perForce, 3 + i)
    res.push(createMessage(authorForce, 2 + i * 3, orderTypes, startTime))
  }
  return res
}

export const overlapsInTime = (me: GeomWithOrders, other: GeomWithOrders): boolean => {
  const myProps = me.geometry.properties as PlannedProps
  const otherProps = other.geometry.properties as PlannedProps
  if (myProps && otherProps && myProps.startTime && myProps.endTime && otherProps.startTime && otherProps.endTime) {
    return (myProps.startTime <= otherProps.endTime && myProps.endTime >= otherProps.startTime)
  }
  return true
}

export const injectTimes = (orders: GeomWithOrders[]): GeomWithOrders[] => {
  return orders.map((order: GeomWithOrders) => {
    if (order.geometry.properties) {
      const planned = order.geometry.properties as PlannedProps
      if (!planned.startTime) {
        planned.startTime = moment(planned.startDate).valueOf()
        planned.endTime = moment(planned.endDate).valueOf()
      }
    }
    return order
  })
}

export const findPlannedGeometries = (orders: GeomWithOrders[], time: string, windowMins: number): GeomWithOrders[] => {
  const timeStart = moment(time)
  const timeEnd = moment(time).add(windowMins, 'm')
  const inWindow = orders.filter((value: GeomWithOrders) => {
    const props = value.geometry.properties as PlannedProps
    return moment(props.startDate).isSameOrBefore(timeEnd) && moment(props.endDate).isSameOrAfter(timeStart)
  })
  return deepCopy(inWindow)
}

const clean = (val: number): number => {
  const scalar = 1000
  return Math.floor(val * scalar) / scalar
}

export const spatialBinning = (orders: GeomWithOrders[], binsPerSize: number): turf.Feature[] => {
  let bounds: L.LatLngBounds | undefined
  orders.forEach((geom: GeomWithOrders) => {
    const geoAny = geom.geometry.geometry as any
    geoAny.coordinates.forEach((point: number[]) => {
      const pt = L.latLng(point[1], point[0])
      if (!bounds) {
        bounds = L.latLngBounds(pt, pt)
      } else {
        bounds.extend(pt)
      }
    })
  })
  const boxes: turf.Feature[] = []
  if (bounds) {
    const height = bounds.getNorth() - bounds.getSouth()
    const width = bounds.getEast() - bounds.getWest()
    const heightDelta = height / binsPerSize
    const widthDelta = width / binsPerSize
    for (let x = 0; x < binsPerSize; x++) {
      for (let y = 0; y < binsPerSize; y++) {
        const bX = clean(bounds.getWest() + x * widthDelta)
        const bY = clean(bounds.getSouth() + y * heightDelta)
        const tX = clean(bX + widthDelta)
        const tY = clean(bY + heightDelta)
        const poly = [[[bX, bY], [tX, bY], [tX, tY], [bX, tY], [bX, bY]]]
        const turfPoly = turf.polygon(poly)
        if (!turfPoly.properties) {
          turfPoly.properties = {}
        }
        turfPoly.properties.name = 'box_' + (x * binsPerSize + y)
        // pushGeo(poly)
        boxes.push(turfPoly)
      }
    }
  }
  return boxes
}

export interface SpatialBin {
  polygon: turf.Feature
  orders: GeomWithOrders[]
}

export const putInBin = (orders: GeomWithOrders[], bins: turf.Feature[]): SpatialBin[] => {
  const res: SpatialBin[] = []
  bins.forEach((poly: turf.Feature, index: number) => {
    const thisBin: SpatialBin = {
      polygon: poly,
      orders: []
    }
    const polyGeo = poly.geometry as any
    const turfPoly = turf.polygon(polyGeo.coordinates)
    if (index === 7) {
      console.log('seven')
    }
    orders.forEach((order: GeomWithOrders) => {
      const geom = order.geometry.geometry as any
      const coords = geom.coordinates
      switch (order.geometry.geometry.type) {
        case 'Point': {
          const pt = turf.point(coords)
          if (turf.booleanPointInPolygon(pt, turfPoly)) {
            thisBin.orders.push(order)
          }
          break
        }
        case 'LineString': {
          const lineS = turf.lineString(coords)
          if (turf.booleanCrosses(lineS, poly)) {
            thisBin.orders.push(order)
          }
          break
        }
        case 'Polygon': {
          const thisPoly = turf.polygon(coords)
          if (turf.booleanOverlap(poly, thisPoly)) {
            thisBin.orders.push(order)
          }
          break
        }
      }
    })
    // store the bin count
    if (!poly.properties) {
      poly.properties = {}
    }
    poly.properties.orderNum = thisBin.orders.length
    res.push(thisBin)
  })
  return res
}
