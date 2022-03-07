import React from 'react'
import { ForceData, MessageMap, PlayerUi, Role, MappingConstraints, ChannelTypes, ChannelUI } from '@serge/custom-types'
import {
  FORCE_LAYDOWN,
  PERCEPTION_OF_CONTACT,
  STATE_OF_WORLD,
  CREATE_TASK_GROUP,
  LEAVE_TASK_GROUP,
  HOST_PLATFORM,
  SUBMIT_PLANS,
  DELETE_PLATFORM,
  VISIBILITY_CHANGES,
  CHANNEL_MAPPING,
  Phase,
  CHANNEL_COLLAB,
  CHANNEL_CUSTOM,
  CHANNEL_CHAT
} from '@serge/config'
import { sendMapMessage, isChatChannel } from '@serge/helpers'
import { TabNode, TabSetNode } from 'flexlayout-react'
import { saveMapMessage } from '../../../ActionsAndReducers/playerUi/playerUi_ActionCreators'
import { Mapping, Assets, HexGrid } from '@serge/components'
import _ from 'lodash'
import ChatChannel from '../../../Components/ChatChannel'
import findChannelByName from './findChannelByName'
import { Domain } from '@serge/config'
import CollabChannel from '../../../Components/CollabChannel'

type Factory = (node: TabNode) => React.ReactNode

/** utility to find the role for this role name */
const findRole = (roleId: string, forceData: ForceData | undefined): Role => {
  if (forceData) {
    const role = forceData.roles.find((role: Role) => role.roleId === roleId)
    if (role) {
      return role
    }
  }
  throw new Error('Role not found for id:' + roleId);
}

/** convert phase as a string to the enum type
 * Note: we were using Phase[state.phase], but it only
 * accepted the capitalised value. That's why this 
 * convenience function was created.
 */
const phaseFor = (phase: string): Phase => {
  return phase === 'planning' ? Phase.Planning : Phase.Adjudication
}

type OnMessageCountChange = (unreadMessageForChannel: {
  [property: string]: number
}) => void

const factory = (state: PlayerUi): Factory => {

  // provide some default mapping constraints if we aren't supplied with any
  const mappingConstraints: MappingConstraints = state.mappingConstaints || {
    bounds: [[14.194809302, 42.3558566271], [12.401259302, 43.7417816271]],
    tileDiameterMins: 5,
    tileLayer: {
      url: './gulf_tiles/{z}/{x}/{y}.png',
      attribution: 'Generated by QTiles'
    },
    minZoom: 8,
    maxZoom: 13,
    maxNativeZoom: 12,
    minZoomHexes: 8,
    targetDataset: Domain.GULF
  }

  const mapPostBack = (form: string, payload: MessageMap, channelID: string | number = ''): void => {
    if (channelID === '') return
    if (typeof channelID === 'number') channelID = channelID.toString()
    const turnNumber = state.currentTurn

    switch (form) {
      case FORCE_LAYDOWN:
        sendMapMessage(FORCE_LAYDOWN, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case VISIBILITY_CHANGES:
        sendMapMessage(VISIBILITY_CHANGES, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case PERCEPTION_OF_CONTACT:
        sendMapMessage(PERCEPTION_OF_CONTACT, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case SUBMIT_PLANS:
        sendMapMessage(SUBMIT_PLANS, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case STATE_OF_WORLD:
        sendMapMessage(STATE_OF_WORLD, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case CREATE_TASK_GROUP:
        sendMapMessage(CREATE_TASK_GROUP, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case LEAVE_TASK_GROUP:
        sendMapMessage(LEAVE_TASK_GROUP, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case HOST_PLATFORM:
        sendMapMessage(HOST_PLATFORM, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      case DELETE_PLATFORM:
        sendMapMessage(DELETE_PLATFORM, payload, state.selectedForce, channelID, state.selectedRole, state.selectedRoleName, state.currentWargame, turnNumber, saveMapMessage)
        break
      default:
        console.log('Handler not created for', form)
    }
  }

  return (node: TabNode): React.ReactNode => {

    /** helper to determine if the specified channel should be rendered */
    const renderThisChannel = (channelData?: ChannelUI): boolean => {
      if (channelData) {
        // always render the special channels, since the user may have
        // a partially completed form/document in it - we don't want to
        // lose that content.  Note: there _Shouldn't_ be a performance
        // hit, since the content in those channels won't be changing
        const cType = channelData.cData.channelType
        if(cType === CHANNEL_COLLAB || cType === CHANNEL_MAPPING) {
          return true
        }
      }
      return node.isVisible()
    }

    // sort out if role can submit orders
    const role: Role = findRole(state.selectedRole, state.selectedForce)
    const canSubmitOrders: boolean = !!role.canSubmitPlans

    /**
     * If a maximized tabset exists but the current tabset node is not this one
     * Do not render it
     */
    const hasMaximizeTab = node.getModel().getMaximizedTabset()
    const tabSetNode = node.getParent() as TabSetNode
    if (hasMaximizeTab && !tabSetNode.isMaximized()) {
      return
    }

    // note: we have to convert the bounds that comes from the database
    // from a number array to a Leaflet bounds object.
    // Render the map
    const renderMap = (channelid: string) => <Mapping
      mappingConstraints={mappingConstraints}
      forces={state.allForces}
      mapBar={true}
      platforms={state.allPlatformTypes}
      phase={phaseFor(state.phase)}
      turnNumber={state.currentTurn}
      playerForce={state.selectedForce ? state.selectedForce.uniqid : ''}
      canSubmitOrders={canSubmitOrders}
      channelID={channelid}
      mapPostBack={mapPostBack}
      gameTurnTime={state.gameTurnTime}
      wargameInitiated={state.wargameInitiated}
      platformTypesByKey={state.allPlatformTypesByKey}
    >
      <Assets />
      <HexGrid />
    </Mapping>

    if (_.isEmpty(state.channels)) return

    const matchedChannel = findChannelByName(state.channels, node.getName())
    if (!matchedChannel || !renderThisChannel(matchedChannel[1])) {
      return null
    }
    const channelName = node.getName().toLowerCase()
    const channelDefinition = state.allChannels.find((channel) => channel.name === node.getName())

    if (!channelDefinition) {
      throw new Error('Failed to find channel with id:' + node.getName())
    }

    // sort out if it's a modern channel
    const v3Channel = channelDefinition as unknown as ChannelTypes
    const isV3 = !!v3Channel.channelType
    if (isV3) {
      switch (v3Channel.channelType) {
        case CHANNEL_COLLAB:
          return <CollabChannel channelId={matchedChannel[0]} />
        case CHANNEL_CHAT:
          return <ChatChannel channelId={matchedChannel[0]} />
        case CHANNEL_MAPPING:
          return renderMap(node.getId())
        case CHANNEL_CUSTOM:
        default:
          console.log('not yet handling', v3Channel.channelType)
      }
    } else {
      if (channelName === CHANNEL_MAPPING) {
        return renderMap(node.getId())
      } else if (matchedChannel.length) {
        // find out if channel just contains chat template
        if (isChatChannel(channelDefinition)) {
          return <ChatChannel channelId={matchedChannel[0]} />
        } else {
          console.log("Not rendering channel for ", channelDefinition)
        }
      }
    }
  }
}

export default factory
