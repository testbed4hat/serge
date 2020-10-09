import { upperFirst } from 'lodash'

/** provide classnames for an asset, as perceived by current player
 * @param {string} myForce force of current player
 * @param {string} theirName name of selected asset
 * @param {string} theirContactID contactID of selected asset (used when no perceived name)
 * @param {string} theirForce force for selected asset
 * @param {string} theirType platform-type of selected asset
 * @param {any} theirPerceptions list of force perceptions of selected asset
 * @param {boolean} playerIsUmpire whether the current player is an umpire
 * @returns {string, string, string} name-class, force-class, type-class
 */
export default function findPerceivedAsTypes (
  myForce: string,
  theirName: string,
  theirContactID: string,
  theirForce: string,
  theirType: string,
  theirPerceptions: [any],
  userIsUmpire: boolean
): [string, string, string] {
  let perception: any
  if (myForce.toLowerCase() === theirForce.toLowerCase() || userIsUmpire) {
    // just use the real value
    perception = { name: theirName, force: theirForce, type: theirType }
  } else {
    if (theirPerceptions) {
      if(Array.isArray(theirPerceptions)) {
        // use the perceived values
        perception = theirPerceptions.find(p => p.by.toLowerCase() === myForce.toLowerCase()) || null
      } else {
        const upperForce = upperFirst(myForce)
        const tmpPerception = theirPerceptions[upperForce]
        perception = tmpPerception ? tmpPerception : null
      }
    } else {
      perception = null
    }
  }
  if (perception) {
    const nameClass: string = perception.name ? perception.name : theirContactID
    const forceClass: string = perception.force ? perception.force.replace(/ /g, '-').toLowerCase() : 'unknown'
    const typeClass: string = perception.type ? perception.type.replace(/ /g, '-').toLowerCase() : 'unknown'
    return [nameClass, forceClass, typeClass]
  } else {
    return perception
  }
}