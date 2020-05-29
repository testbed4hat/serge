import { RouteStore, SelectedAsset } from '@serge/custom-types'

export default interface PropTypes {
  /**
   * The name of the thing
   */
  name: string
  /**
   * the set of routes currently being planned
   */
  store?: RouteStore
  /** 
   * callback for asset selected
   */
  setSelectedAsset?: {(id:string): void}
}
