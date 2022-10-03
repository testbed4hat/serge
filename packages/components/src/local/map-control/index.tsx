import AddIcon from '@material-ui/icons/Add'
import HistoryIcon from '@material-ui/icons/History'
import HomeIcon from '@material-ui/icons/Home'
import InfoIcon from '@material-ui/icons/Info'
import RemoveIcon from '@material-ui/icons/Remove'
import PlannedIcon from '@material-ui/icons/Update'
import { CellLabelStyle } from '@serge/config'
import cx from 'classnames'
import { DomEvent, LatLngBounds } from 'leaflet'
import React, { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet-v4'
import Item from './helpers/item'
import PropTypes from './types/props'
interface CellStyleDetails {
  label: string
  value: CellLabelStyle
  active: boolean
}

export const MapControl: React.FC<PropTypes> = ({
  /* main */
  map,
  children,
  /* home */
  showHome = true,
  bounds,
  /* zoom */
  showZoom = true,
  zoomStepSize = 0.5,
  cellLabelCallback,
  cellLabelType,
  filterPlannedRoutes,
  setFilterPlannedRoutes,
  filterHistoryRoutes,
  setFilterHistoryRoutes,
  addInfoMarker,
  actionCallback,
  actionItems,
  mapVer = 'v2'
}) => {
  const [cellStyles, setCellStyles] = useState<CellStyleDetails[]>([])
  const [originalBounds, setOriginalBounds] = useState<LatLngBounds | undefined>(undefined)
  const localMap = mapVer === 'v4' ? useMap() : map

  /** the forces from props has changed */
  useEffect(() => {
    if (originalBounds === undefined) {
      setOriginalBounds(bounds)
    }
  }, [bounds])

  /*
   * disable map scroll and click events to allow
   * to use map control  as usual html
   */
  const disableMapClickAndScrolll = (ref: any): void => {
    if (ref) {
      DomEvent.disableClickPropagation(ref).disableScrollPropagation(ref)
    }
  }
  /* change map zoom level */
  const handleZoomChange = (changeValue: number): void => {
    if (!localMap) {
      return
    }
    const currentZoom = localMap.getZoom()
    if (currentZoom) localMap.setZoom(currentZoom + changeValue)
  }

  /* set map to overall view */
  const handleHome = (): void => {
    if (!localMap || !originalBounds) {
      return
    }
    localMap.flyToBounds(originalBounds, { duration: 0.75 })
  }

  /* utilty method for whether we're filtering planned routes  */
  const isFilterAsPlannedRoutes = (): 'light' | 'dark' => {
    return filterPlannedRoutes ? 'dark' : 'light'
  }

  /* utilty method for whether we're filtering planned routes  */
  const isFilterAsHistoryRoutes = (): 'light' | 'dark' => {
    return filterHistoryRoutes ? 'dark' : 'light'
  }

  /* callback responding to filter planned routes toggle  */
  const togglePlannedFilter = (): void => {
    if (setFilterPlannedRoutes) {
      setFilterPlannedRoutes(!filterPlannedRoutes)
    }
  }

  /* callback responding to filter planned routes toggle  */
  const toggleHistoryFilter = (): void => {
    if (setFilterHistoryRoutes) {
      setFilterHistoryRoutes(!filterHistoryRoutes)
    }
  }

  /** the forces from props has changed */
  useEffect(() => {
    const storeStyle = (label: string, style: CellLabelStyle, current: CellLabelStyle | undefined): CellStyleDetails => {
      return {
        label: label,
        value: style,
        active: style === current
      }
    }

    // collate the cell styles
    const cellStyleList: CellStyleDetails[] = [
      storeStyle('Ctr', CellLabelStyle.CTR_LABELS, cellLabelType),
      storeStyle('H3', CellLabelStyle.H3_LABELS, cellLabelType),
      storeStyle('L/L', CellLabelStyle.LAT_LON_LABELS, cellLabelType),
      storeStyle('X-Y', CellLabelStyle.X_Y_LABELS, cellLabelType),
      storeStyle(' ', CellLabelStyle.BLANK, cellLabelType)
    ]
    setCellStyles(cellStyleList)
  }, [cellLabelType])

  if (!localMap) return null

  if (actionCallback) {
    console.log('provide drop-down menu for items', actionItems)
  }

  return (
    <div className='leaflet-control-container' ref={disableMapClickAndScrolll}>
      <div className='leaflet-top leaflet-right'>
        <div className={cx('leaflet-control')} data-tour="zoom-control">
          {showZoom && <Item title="Zoom In" onClick={(): void => { handleZoomChange(zoomStepSize) }}><AddIcon /></Item>}
          {showHome && <Item title="Fit to window" onClick={(): void => { handleHome() }}><HomeIcon /></Item>}
          {showZoom && <Item title="Zoom Out" onClick={(): void => { handleZoomChange(-1 * zoomStepSize) }}><RemoveIcon /></Item>}
        </div>
        {actionCallback &&
          <div className={cx('leaflet-control')}>
            {/* popup tree of action items when below button clicked */}
            <Item title="New orders" >New orders...</Item>
          </div>
        }
        <div className={cx('leaflet-control')} data-tour="counter-clockwise">
          {
            setFilterHistoryRoutes &&
            <Item title="View full history" onClick={(): void => { toggleHistoryFilter() }}
              contentTheme={isFilterAsHistoryRoutes()} >
              <HistoryIcon />
            </Item>
          }
          {
            setFilterPlannedRoutes &&
            <Item title="View all planned steps" onClick={(): void => { togglePlannedFilter() }}
              contentTheme={isFilterAsPlannedRoutes()} >
              <PlannedIcon />
            </Item>
          }
        </div>
        {addInfoMarker &&
          <div className={cx('leaflet-control')}>
            <Item title='Add information marker' onClick={(): void => { addInfoMarker() }}
              contentTheme={'dark'} >
              <InfoIcon />
            </Item>
          </div>
        }
        {cellLabelCallback && cellStyles.length > 0 && <div className={cx('leaflet-control')}>
          {cellStyles.map((style: CellStyleDetails): JSX.Element => (
            <Item
              contentTheme={style.active ? 'light' : 'dark'}
              key={`s_${style.value}`}
              onClick={(): void => { cellLabelCallback && cellLabelCallback(style.value) }}
              title={'Style cells as ' + style.label}
            >
              {style.label}
            </Item>
          ))}
        </div>}
        {children}
      </div>
    </div>
  )
}

export default MapControl
