import { CellLabelStyle } from '@serge/config'
import { ForceData } from '@serge/custom-types'
import { LatLng, LatLngBounds, Map } from 'leaflet'

export default interface PropTypes {
  // main
  map?: Map
  // whether to show home control
  showHome?: boolean
  // current map centre
  home?: LatLng
  // outer bounds of whole map
  bounds?: LatLngBounds
  // whether to show zoom control
  showZoom?: boolean
  // size of zoom in/out increment
  zoomStepSize?: number
  /** callback for umpire clicking on view-as button */
  cellLabelCallback?: { (style: CellLabelStyle): void }
  /** current value of `view as` */
  cellLabelType?: CellLabelStyle
  /** whether planned routes filtered */
  filterPlannedRoutes?: boolean
  /** callback for toggling planned routes */
  setFilterPlannedRoutes?: { (value: boolean): void }
  /** whether History routes filtered */
  filterHistoryRoutes?: boolean
  /** callback for toggling History routes */
  setFilterHistoryRoutes?: { (value: boolean): void }
  /** callback for adding a new information marker */
  addInfoMarker?: { (): void }
  /** if filter is applied */
  filterApplied?: boolean
  /** callback for applying filter */
  setFilterApplied?: { (value: boolean): void }
  /** tree of menu items */
  actionItems?: MappingMenuItem[]
  /** callback, for if a map action is clicked */
  actionCallback?: { (force: string, category: string, actionId: string): void }

  mapVer?: 'v2' | 'v4'
}
