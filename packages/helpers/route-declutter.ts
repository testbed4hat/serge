import L from 'leaflet'
import { RouteStore, Route, RouteStep } from '@serge/custom-types'
import { cloneDeep } from 'lodash'

interface ClusterItem {
  name: string,
  setter: {(newLoc: L.LatLng): void}
}


interface Cluster {
  position: string,
  location: L.LatLng,
  items: Array<ClusterItem>
}

const storeInCluster = (store: Array<Cluster>, setter: {(newLoc: L.LatLng): void}, position: string, location: L.LatLng, name: string ): void => {
  let cluster: Cluster | undefined = store.find(cluster => cluster.position === position)
  if(cluster === undefined) {
    cluster = {
      position: position,
      location: location,
      items: []
    }
    store.push(cluster)
  }
  const item: ClusterItem = {
    name: name,
    setter: setter
  }
  cluster.items.push(item)
}

const findLocations = (store: RouteStore, selected: string | undefined): Array<Cluster> => {
 //  const res: { [position: string]: Array<RouteLocation> } = {};
 // const res: Record<string, string >  = {}
 const res: Array<Cluster> = []

  // loop through store
  store.routes.forEach((route: Route) => {
    // start with location
    if(route.currentLocation) {
      const updateAssetLocation = (newLoc: L.LatLng): void => {
        route.currentLocation = newLoc
      }
      storeInCluster(res, updateAssetLocation, route.currentPosition, route.currentLocation, route.name)
    }

    // now planned routes
    const numSteps: number = route.planned.length
    for(let stepCtr:number = 0; stepCtr < numSteps; stepCtr++) {
      const step: RouteStep = route.planned[stepCtr]
      if(step.locations && step.coords) {
        let len = step.locations.length
        for(let ctr:number = 0; ctr < len; ctr++) {
          const thisPos: string = step.coords[ctr]
          const updateThisStep = (newLoc: L.LatLng): void => {
            if(step.locations) {
              step.locations[ctr] = newLoc
            }
          }
          if(route.uniqid === selected && stepCtr === numSteps - 1 && ctr === len - 1) {
            // this is the selected track, and we're on the last step of the last turn
            // so don't declutter it
          } else {
            storeInCluster(res, updateThisStep, thisPos, step.locations[ctr], 'planned-step-' + thisPos)
          }
        }
      }
    }

    // and historic tracks
    route.history.forEach((step: RouteStep) => {
      if(step.locations && step.coords) {
        let len = step.locations.length
        for(let ctr:number = 0; ctr < len; ctr++) {
          const thisPos: string = step.coords[ctr]
          const updateThisStep = (newLoc: L.LatLng): void => {
            if(step.locations) {
              step.locations[ctr] = newLoc
            }
          }
          storeInCluster(res, updateThisStep, thisPos, step.locations[ctr], 'history-step-' + thisPos)
        }
      }
    })
  }) 
  return res
}

const spreadClusters = (clusters: Array<Cluster>, tileDiameterMins: number): void => {
  clusters.forEach((cluster: Cluster) => {
    if(cluster.items && cluster.items.length > 1) {
      const gridDelta = tileDiameterMins / 60 / 4
      // ok, go for it
      const len = cluster.items.length
      // note: we start at 1, since we let the first one stay in the middle
      for (let ctr = 0; ctr < len; ctr++) {
        const thisAngleDegs = ctr * (360.0 / (len))
        const thisAngleRads = (thisAngleDegs) / 180 * Math.PI
        const centre = cluster.location
        const newLat = centre.lat + gridDelta * Math.sin(thisAngleRads)
        const newLng = centre.lng + gridDelta * Math.cos(thisAngleRads)
        const newLoc = L.latLng(newLat, newLng)
        const item: ClusterItem = cluster.items[ctr]
        item.setter(newLoc)
      }
    }
  })
}

/** declutter assets & turn markers
 * @param {RouteStore} store wargame data object
 * @param {number} tileDiameterMins hex cell diameter
 * @returns {RouteStore} decluttered route store
 */
const routeDeclutter = (store: RouteStore, tileDiameterMins: number): RouteStore => {
  // take deep copy
  const modified: RouteStore = cloneDeep(store)

  // get the id of the selected asset
  const selected: string | undefined = store.selected && store.selected.uniqid

  // find all clusters
  const clusters: Array<Cluster> = findLocations(modified, selected)

  // now spread out the clusters (note: we're already working with a clone)
  spreadClusters(clusters, tileDiameterMins)

  return modified
}

export default routeDeclutter
