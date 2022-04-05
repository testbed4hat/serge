import { UMPIRE_FORCE, UMPIRE_FORCE_NAME } from '@serge/config'
import { Perception, PerceivedTypes, PlatformTypeData, ForceData } from '@serge/custom-types'

/** provide classnames for an asset, as perceived by current player
 * // TODO: switch from force name to force id, for both "my" and "their"
 * @param {string} myForce force of current player
 * @param {string} myForceId force id of current player
 * @param {string} theirName name of selected asset
 * @param {boolean} visibleToPlayerForce whether this asset is visible to player force
 * @param {string} theirContactID contactID of selected asset (used when no perceived name)
 * @param {string} theirForce force for selected asset
 * @param {string} theirType platform-type of selected asset
 * @param {string} theirTypeId platform-type of selected asset
 * @param {Perception[]} theirPerceptions list of force perceptions of selected asset
 * @param {boolean} playerIsUmpire whether the current player is an umpire
 * @returns {string, string, string} name-class, force-class, type-class
 */
export default function findPerceivedAsTypes (
  myForceId: ForceData['uniqid'],
  theirName: string,
  visibleToPlayerForce: boolean,
  theirContactID: string,
  theirForceId: ForceData['uniqid'],
  theirType: string,
  theirTypeId: PlatformTypeData['uniqid'],
  theirPerceptions: Perception[]
): PerceivedTypes | null {
  let tmpPerception: Perception | null
  if (myForceId === theirForceId || visibleToPlayerForce || myForceId === UMPIRE_FORCE || myForceId === UMPIRE_FORCE_NAME) {
    // just use the real values
    tmpPerception = { name: theirName, force: theirForceId, type: theirType, typeId: theirTypeId, by: myForceId }
  } else {
    // use the perceived values
    tmpPerception = theirPerceptions.find(p => p.by === myForceId) || null
  }
  if (tmpPerception) {
    const nameClass: string = tmpPerception.name ? tmpPerception.name : theirContactID
    const forceClass: string = tmpPerception.force ? tmpPerception.force.replace(/ /g, '-').toLowerCase() : 'unknown'
    const typeClass: string = tmpPerception.type ? tmpPerception.type.replace(/ /g, '-').toLowerCase() : 'unknown'
    return { name: nameClass, force: forceClass, type: typeClass, typeId: tmpPerception.typeId, forceName: tmpPerception.force }
  } else {
    return null
  }
}
