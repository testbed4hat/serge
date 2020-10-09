import React, { useEffect, useState } from 'react'

import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import Button from '../form-elements/button'
import cx from 'classnames'
import { getIconClassname } from '../asset-icon'
import Groups from '../helper-elements/groups'
// import update from 'react-addons-update'

/* Import Types */
import PropTypes from './types/props'
import { NodeType } from '../helper-elements/groups/types/props'
import { GroupItem, Route } from '@serge/custom-types'
/* Import Stylesheet */
import styles from './styles.module.scss'

import { ADJUDICATION_PHASE } from '@serge/config'
import canCombineWith from './helpers/can-combine-with'

export const WorldState: React.FC<PropTypes> = ({
  name, store, phase, isUmpire, setSelectedAsset,
  submitTitle, submitForm, showOtherPlatforms, gridCells, groupMoveToRoot, groupCreateNewGroup, groupHostPlatform
}: PropTypes) => {
  const [tmpRoutes, setTmpRoutes] = useState<Array<Route>>(store.routes)

  /** filter the list of cells allowable for this platform
   * depending on requested cell type
   */

  useEffect(() => {
    setTmpRoutes(store.routes.filter(r => r.underControl === !showOtherPlatforms))
  }, [store, phase, showOtherPlatforms])

  // an asset has been clicked on
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

  /**
   *
   * @param {PlannedRoute} pRoute this planned route
   * @param {string} forceName name of the force, it's not available lower down the tree
   * @param {boolean} topLevel if this is at the top level of the tree - used to control the level of detail supplied
   * @returns  JSX for this route, plus children if applicable
   */

  // sort out which title to use on orders panel
  const customTitle = showOtherPlatforms ? 'Other Visible Platforms' : name

  // find out if this is a non-umpire, and we're in the adjudication phase
  const playerInAdjudication: boolean = !isUmpire && phase === ADJUDICATION_PHASE

  const renderContent = (item: GroupItem, depth: Array<GroupItem> = []): JSX.Element => {
    // const item = routeItem as PlannedRoute
    let forceName: string = item.perceivedForceName || ''
    // if we don't know the force name, just use the one from the parent

    if (!forceName) {
      const itemWithForceName = depth.find(i => i && i.perceivedForceName)
      if (itemWithForceName) forceName = itemWithForceName.perceivedForceName
    }

    const icClassName = getIconClassname(forceName.toLowerCase(), item.platformType.toLowerCase(), item.selected)
    const numPlanned = Array.isArray(item.planned) ? item.planned.length : 0
    const descriptionText = (isUmpire || item.underControl) && depth.length === 0
      ? `${numPlanned} turns planned` : ''
    const checkStatus: boolean = numPlanned > 0

    return (
      <div className={styles.item} onClick={(): any => clickEvent(`${item.uniqid}`)}>
        <div className={cx(icClassName, styles['item-icon'])}/>
        <div className={styles['item-content']}>
          <div>
            <p>{item.name}</p>
            <p>{descriptionText}</p>
          </div>

        </div>
        {!showOtherPlatforms && depth.length === 0 && <div className={styles['item-check']}>
          {checkStatus === true && <CheckCircleIcon style={{ color: '#007219' }} />}
          {checkStatus === false && <CheckCircleIcon style={{ color: '#B1B1B1' }} />}
        </div>}
      </div>
    )
  }

  // const removeItem = (items: Array<GroupItem>, removeKeys: Array<ReactText>): Array<GroupItem> => items.filter(item => {
  //   if (removeKeys.includes(item.uniqid)) return false
  //   if (Array.isArray(item.comprising)) { item.comprising = removeItem(item.comprising, removeKeys) }
  //   if (Array.isArray(item.hosting)) { item.hosting = removeItem(item.hosting, removeKeys) }
  //   return true
  // })

  // const createNewGroup = (routes: Array<GroupItem>, items: Array<GroupItem>, depth: Array<GroupItem>, forceName: string, index = 0): Array<GroupItem> => {
  //   if (depth.length > 0 && index < depth.length) {
  //     return routes.map(item => {
  //       if (item.uniqid === depth[index].uniqid) {
  //         item.comprising = createNewGroup(item.comprising || [], items, depth, forceName, index + 1)
  //         if (index < depth.length - 1) item.hosting = createNewGroup(item.hosting || [], items, depth, forceName, index + 1)
  //       }
  //       return item
  //     })
  //   } else {
  //     const newGroup = {
  //       name: 'new group',
  //       comprising: items,
  //       perceivedForceName: forceName,
  //       hosting: [],
  //       numPlanned: 0,
  //       platformType: 'task-group',
  //       selected: false,
  //       underControl: true,
  //       uniqid: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
  //     }

  //     return [
  //       ...routes,
  //       newGroup as GroupItem
  //     ]
  //   }
  // }
  // const moveToGroup = (routes: Array<GroupItem>, droppedInTo: GroupItem, droppedItem: GroupItem): Array<GroupItem> => {
  //   return routes.map(item => {
  //     if (Array.isArray(item.comprising)) {
  //       if (item.uniqid === droppedInTo.uniqid) {
  //         item.comprising = [...item.comprising, droppedItem]
  //       } else {
  //         item.comprising = moveToGroup(item.comprising, droppedInTo, droppedItem)
  //       }
  //     }
  //     return item
  //   })
  // }

  // Note: draggingItem.uniq === -1 when no active dragging item
  const canCombineWithLocal = (draggingItem: GroupItem, item: GroupItem, _parents: Array<GroupItem>, _type: NodeType): boolean => {
    // console.log(draggingItem.uniqid, item.uniqid, _type, _parents)
    return canCombineWith(store, draggingItem.uniqid, item.uniqid, _parents, _type, gridCells)
  }

  return <>
    <div className={styles['world-state']}>
      <h2 className={styles.title}>{customTitle}</h2>

      <Groups
        items={tmpRoutes}
        renderContent={renderContent}
        canCombineWith={canCombineWithLocal}
        onSet={(itemsLink: any, type: any, depth: any): void => {
          const items = itemsLink.slice(0)
          const [droppedItem, droppedInTo] = items
          // TODO: remove setTmpRoutes and use api
          switch (type) {
            case 'group': {
              if (groupCreateNewGroup) {
                groupCreateNewGroup(droppedItem.uniqid, droppedInTo.uniqid)
              } else {
                console.warn('No new group handler', depth)
              }
              break
            }
            case 'group-out': {
              if (groupMoveToRoot) {
                groupMoveToRoot(droppedItem.uniqid)
              } else {
                console.warn('No move to root handler found')
              }
              break
            }
            default:
              if (groupHostPlatform) {
                groupHostPlatform(droppedItem.uniqid, droppedInTo.uniqid)
              } else {
                console.warn('No handler for host platform')
              }
              break
          }
        }}
      />
      {submitTitle && !showOtherPlatforms && !playerInAdjudication &&
        <div className={styles.submit}>
          <Button size='m' onClick={submitCallback}>{submitTitle}</Button>
        </div>
      }
    </div>
  </>
}

export default WorldState