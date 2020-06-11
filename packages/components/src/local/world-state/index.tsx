import React, { useEffect, useState } from 'react'

import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import cx from 'classnames'
import { getIconClassname } from '../asset-icon'

/* Import Types */
import PropTypes from './types/props'

/* Import Stylesheet */
import styles from './styles.module.scss'
import { Route } from '@serge/custom-types'
import { ADJUDICATION_PHASE } from '@serge/config'

interface PlannedRoute {
  name: string
  uniqid: string
  numPlanned: number
  underControl: boolean
  forceName: string
  platformType: string
  selected: boolean
}

export const WorldState: React.FC<PropTypes> = ({
  name, store, phase, isUmpire, setSelectedAsset,
  submitTitle, submitForm, showOtherPlatforms
}: PropTypes) => {
  const [routes, setRoutes] = useState<Array<PlannedRoute>>([])

  /** filter the list of cells allowable for this platform
   * depending on requested cell type
   */
  useEffect(() => {
    const tmpRoutes: PlannedRoute[] = []
    store.routes.forEach((route: Route) => {
      const pRoute: PlannedRoute = {
        name: route.name,
        uniqid: route.uniqid,
        numPlanned: route.planned.length,
        underControl: route.underControl,
        forceName: route.perceivedForceName,
        platformType: route.platformType,
        selected: route.selected
      }
      tmpRoutes.push(pRoute)
    })
    setRoutes(tmpRoutes)
  }, [store, phase])

  // Toggles the map bar on and off
  const clickEvent = (id: string): void => {
    if (setSelectedAsset) {
      setSelectedAsset(id)
    }
  }

  const submitCallback = (): any => {
    if (submitForm) {
      submitForm()
    }
  }

  const renderItem = (pRoute: PlannedRoute): JSX.Element => {
    const descriptionText = isUmpire || pRoute.underControl ?
      `${pRoute.numPlanned} turns planned` : ''

    // TODO: ... add other versions for description

    const checkStatus: boolean = pRoute.numPlanned > 0

    const icClassName = getIconClassname(pRoute.forceName.toLowerCase(), pRoute.platformType, pRoute.selected)

    return (
      <div className={styles.item}>
        <div className={cx(icClassName, styles['item-icon'])}/>
        <div className={styles['item-content']}>
          <div>
            <p>{pRoute.name}</p>
            <p>{descriptionText}</p>
          </div>
        </div>
        {!showOtherPlatforms && <div className={styles['item-check']}>
          {checkStatus === true && <CheckCircleIcon style={{ color: '#007219' }} />}
          {checkStatus === false && <CheckCircleIcon style={{ color: '#B1B1B1' }} />}
        </div>}
      </div>
    )
  }

  // Remove it if you want name from props
  const customTitle = showOtherPlatforms ? 'Other Visible Platforms' : 'Orders'

  // find out if this is a non-umpire, and we're in the adjudication phase
  const playerInAdjudication: boolean = !isUmpire && phase === ADJUDICATION_PHASE

  return <>
    <div className={styles['world-state']}>
      <h2 className={styles.title}>{customTitle || name}</h2>
      <ul>
        {routes
          .filter((pRoute: PlannedRoute) => pRoute.underControl === !showOtherPlatforms)
          .map((pRoute: PlannedRoute): any => (
            <li
              key={'r_li_' + pRoute.uniqid}
              onClick={(): any => clickEvent(pRoute.uniqid)}
            >
              {renderItem(pRoute)}
            </li>
          ))
        }
      </ul>
      {submitTitle && !showOtherPlatforms && !playerInAdjudication &&
        <button onClick={submitCallback} className={styles.submit} type="button">{submitTitle}</button>
      }
    </div>
  </>
}

export default WorldState
