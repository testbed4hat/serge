import { faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ChangeEvent, Fragment } from 'react'
import styles from '../styles.module.scss'
import { ProppertiesPanelProps, SelectedProps } from '../types/props'
import { PropertyType } from 'src/custom-types'

const componentFor = (key: string, prop: SelectedProps, propertyType: PropertyType, value: any, disableIdEdit: boolean, isId: boolean, onPropertiesChange: any): React.ReactNode => {
  switch (propertyType.type) {
    case 'StringProperty': {
      if (propertyType.lines && propertyType.lines > 0) {
        return <textarea value={value} disabled={disableIdEdit && isId} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onPropertiesChange(key, e.target.value)} rows={propertyType.lines} />
      } else {
        return <input value={value} disabled={disableIdEdit && isId} onChange={(e: ChangeEvent<HTMLInputElement>) => onPropertiesChange(key, e.target.value)} />
      }
    } 
    case 'EnumProperty': {
      return <select value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => onPropertiesChange(key, e.target.value)}>
        {propertyType.choices.map((o: string) => (<option key={o} value={o}>{o}</option>))}
      </select>
    } 
    case 'NumberProperty': {
      return <input value={value} disabled={disableIdEdit && isId} onChange={(e: ChangeEvent<HTMLInputElement>) => onPropertiesChange(key, e.target.value)} />
    }
    default: {
      console.warn('Failed to generate component for ' + prop.type)
      return <></>
    }
  }
}

const PropertiesPanel: React.FC<ProppertiesPanelProps> = ({ selectedProp, onPropertiesChange, onRemoveFilter, disableIdEdit, rendererProps }) => {
  return <Fragment>
    {
      Object.keys(selectedProp).map((key, kIdx) => {
        const field = selectedProp[key]
        const { value, choices } = field

        switch (key) {
          case 'lat': {
            const latValue = selectedProp.lat.value
            const lngValue = selectedProp.lng.value
            return <div key={key + kIdx} className={styles.itemsBox}>
              <p>Lat/Lng:</p>
              <div className={styles.latLng}>
                <input style={{ width: '49%' }} value={latValue} onChange={(e: ChangeEvent<HTMLInputElement>) => onPropertiesChange('lat', e.target.value)} />
                <input style={{ width: '49%' }} value={lngValue} onChange={(e: ChangeEvent<HTMLInputElement>) => onPropertiesChange('lng', e.target.value)} />
              </div>
            </div>  
          }
          case 'lng': {
            return <Fragment key={key + kIdx}></Fragment>
          }
          default: {
            // check if this is the id property (since we don't allow that to be edited)
            const isId = key === 'id'

            // look for this id in the rendererProps. If present, use that to decide how to construct
            // the edit component (especially textarea when `lines` present).  If no reendererProps present
            // then use existing data-driven approach.

            // 1. if a `description` is provided, use that as a tooltip.
            // 2. if it's a StringProperty and `lines` is present, use a textarea
            // 3. if it's a StringProperty and empty, show `description` in grey default text (not sure what that UI
            //    practice is called)
            const prop: PropertyType | undefined = rendererProps?.find((p) => p.id === key)

            if (prop) {
              const title = prop.description && prop.description.length > 0 ? prop.description : 'jimno'
              return <div key={key + kIdx} className={styles.itemsBox} title={title}>
                <p>{key}:</p>
                <div>
                  { componentFor(key, field, prop, value, disableIdEdit, isId, onPropertiesChange)}
                </div>
                {onRemoveFilter && <FontAwesomeIcon icon={faMinusCircle} className={styles.removeIcon} onClick={() => onRemoveFilter(key)}/>}
              </div>
            } else {
              return <div key={key + kIdx} className={styles.itemsBox}>
                <p>{key}:</p>
                <div>
                  {choices.length > 0
                    ? <select value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => onPropertiesChange(key, e.target.value)}>
                      {choices.map((o: string) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                    : <input value={value} disabled={disableIdEdit && isId} onChange={(e: ChangeEvent<HTMLInputElement>) => onPropertiesChange(key, e.target.value)} />
                  }
                </div>
                {onRemoveFilter && <FontAwesomeIcon icon={faMinusCircle} className={styles.removeIcon} onClick={() => onRemoveFilter(key)}/>}
              </div>    
            }
          }
        }
      })
    }
  </Fragment>
}

export default PropertiesPanel
