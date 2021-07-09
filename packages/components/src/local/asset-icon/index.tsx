import React, { useContext, useEffect, useState } from 'react'
import cx from 'classnames'
import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { capitalize } from 'lodash'
import { lightOrDark } from '../map-control/helpers/lightOrDark'
import unfetch from 'node-fetch'

/* Import Types */
import PropTypes from './types/props'

/* Import Stylesheet */
import styles from './styles.module.scss'

/* Import context */
import { MapContext } from '../mapping'
import { SelectedAsset } from '@serge/custom-types'

// TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation
// error based on some webpack version
const fetch = unfetch.bind(window)

/* Export divIcon classname generator to use icons in to other sections */
export const getIconClassname = (icForceClass: string, icType: string, destroyed?: boolean, icSelected?: boolean, imageSrc?: string): string => (cx(
  styles['asset-icon'],
  styles[icForceClass],
  destroyed ? styles.destroyed : null,
  icSelected ? styles.selected : null,
  imageSrc ? styles['asset-icon-with-image'] : styles[`platform-type-${icType}`]
))
const isUrl = (url: string): boolean => {
  return !/base64/.test(url)
}
export const checkUrl = (url: string): string => {
  if (/^https?|^\/\/?|base64|images\/default_img\//.test(url)) {
    return url
  } else {
    const prefix = '/static/media/src/local/asset-icon/counters/'
    return prefix + url
  }
}

interface GetIconProps {
  icType: string
  color?: string
  destroyed?: boolean
  isSelected?: boolean
  imageSrc?: string
}

export const GetIcon = ({ icType, color, destroyed, isSelected, imageSrc }: GetIconProps): React.ReactElement => {
  const [loadStatus, setLoadStatus] = useState(true)
  useEffect(() => {
    checkImageStatus(imageSrc).then(res => { setLoadStatus(res) }).catch(() => { setLoadStatus(false) })
  }, [imageSrc])

  return <div className={styles['asset-icon-background']} style={{ backgroundColor: color }}>
    {imageSrc && loadStatus
      ? <div className={styles['asset-icon-with-image']}>
        <img src={checkUrl(imageSrc)} alt={icType} className={styles.img}/>
      </div>
      : <div className={cx(
        styles['asset-icon'],
        styles['asset-icon-fw'],
        destroyed ? styles.destroyed : null,
        isSelected ? styles.selected : null,
        styles[`platform-type-${icType}`],
        color && lightOrDark(color) === 'light' && styles['asset-icon-invert']
      )}/>}
  </div>
}

const checkImageStatus = (imageSrc: string | undefined): Promise<boolean> => {
  if (imageSrc && isUrl(imageSrc)) {
    return fetch(checkUrl(imageSrc), { method: 'HEAD' })
      .then(res => res.status !== 404)
  }
  return new Promise((resolve) => resolve(true))
}

/* Render component */
export const AssetIcon: React.FC<PropTypes> = ({
  uniqid,
  name,
  contactId,
  position,
  type,
  force,
  perceivedForceClass,
  perceivedForceColor,
  visibleTo,
  controlledBy,
  condition,
  status,
  tooltip,
  selected,
  locationPending,
  imageSrc
}) => {
  const [loadStatus, setLoadStatus] = useState(true)
  const props = useContext(MapContext).props
  if (typeof props === 'undefined') return null
  const { setShowMapBar, setSelectedAsset, selectedAsset } = props

  // TODO: switch to received isDestroyed in props, using value from `Route`
  const isDestroyed: boolean = !!condition && (condition.toLowerCase() === 'destroyed' || condition.toLowerCase() === 'mission kill')

  useEffect(() => {
    checkImageStatus(imageSrc).then(res => { setLoadStatus(res) }).catch(() => { setLoadStatus(false) })
  }, [imageSrc])

  const className = getIconClassname(perceivedForceClass || '', type, isDestroyed, selected, loadStatus ? imageSrc : undefined)
  const image = loadStatus && typeof imageSrc !== 'undefined' ? `<img src="${checkUrl(imageSrc)}" alt="${type}">` : ''

  const divIcon = L.divIcon({
    iconSize: [40, 40],
    html: `<div class='${className}' style="background-color: ${perceivedForceColor}">${image}</div>`
  })

  const clickEvent = (): void => {
    if (selectedAsset && selectedAsset.uniqid === uniqid) {
      // clear selected asset, since it has been clicked again
      // @ts-ignore
      setSelectedAsset(undefined)
      setShowMapBar(false)
    } else {
      // select this asset
      const selection: SelectedAsset = {
        uniqid: uniqid,
        contactId: contactId,
        name: name,
        type: type,
        force: force,
        controlledBy: controlledBy,
        condition: condition || 'unknown',
        visibleTo: visibleTo,
        status: status,
        locationPending: locationPending
      }
      setSelectedAsset(selection)
      setShowMapBar(true)
    }
  }

  return <Marker position={position} icon={divIcon} onclick={clickEvent}>
    <Tooltip>{capitalize(tooltip)}</Tooltip>
  </Marker>
}

export default AssetIcon
