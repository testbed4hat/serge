import React from 'react'
import cx from 'classnames'
import { ArrowRight } from '@material-ui/icons'

/* Import Stylesheet */
import styles from './styles.module.scss'
import { MapContext } from '../mapping'

/* Import child components */
import WorldState from '../world-state'

/* Render component */
export const MapBar: React.FunctionComponent = ({ children }) =>
  <MapContext.Consumer>
    {
      (context): React.ReactNode => {

        
        const { showMapBar, setShowMapBar } = context.props

        const clickEvent = (): void => showMapBar ? setShowMapBar(false) : setShowMapBar(true)

        return (
          <div className={cx(styles['map-bar'], showMapBar && styles['open'])}>
            <div className={styles.toggle} onClick={clickEvent}><ArrowRight /></div>
            <section className={styles.top}>
              <WorldState name="World State"></WorldState>
            </section>
            {children}
          </div>
        )
      }
    }
  </MapContext.Consumer>
  

export default MapBar
