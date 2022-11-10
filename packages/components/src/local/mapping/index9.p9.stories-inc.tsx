// import data types
import { Phase } from '@serge/config'
import { Asset, ChannelMapping, ChannelTypes, ForceData, MappingConstraints, MessageMap, MilliTurns, Role, RouteTurn, Wargame } from '@serge/custom-types'
import { deepCopy } from '@serge/helpers'
/* Import mock data */
import { P9Mock } from '@serge/mocks'
import { Story } from '@storybook/react/types-6-0'
import { h3ToParent } from 'h3-js'
import React from 'react'
import Assets from '../assets'
import { HexGrid } from '../hex-grid'
import InfoMarkers from '../info-markers'
import data from './data/atlantic-cells'
// Import component files
import Mapping from './index'
import docs from './README.md'
import MappingPropTypes from './types/props'
import { uniq } from 'lodash'

const wargame = deepCopy(P9Mock) as Wargame
const forces: ForceData[] = deepCopy(wargame.data.forces.forces)
const platformTypes = (wargame.data.platformTypes && wargame.data.platformTypes.platformTypes) || []
const overview = wargame.data.overview
const annotations = (wargame.data.annotations && wargame.data.annotations.annotations) || []
const mapChannel = wargame.data.channels.channels.find((channel: ChannelTypes) => channel.name === 'mapping') as ChannelMapping
const icons = (wargame.data.annotationIcons && wargame.data.annotationIcons.markers) || []
const mapping = mapChannel.constraints

const wrapper: React.FC = (storyFn: any) => <div style={{ height: '700px' }}>{storyFn()}</div>

console.clear()

const fetchMock = async (): Promise<any> => {
  return {
    json: (): any => data
  }
}

// generate list of roles, for dropdown control
const allRoles: string[] = []
forces.forEach((force: ForceData) => {
  force.roles.forEach((role: Role) => {
    allRoles.push(force.uniqid + ' ~ ' + role.roleId)
  })
})
wargame.data.forces.forces = forces

export default {
  title: 'local/Mapping/P9Trials',
  component: Mapping,
  decorators: [wrapper],
  parameters: {
    readme: {
      // Show readme before story
      content: docs
    },
    options: {
      // We have no addons enabled in this story, so the addon panel should be hidden
      showPanel: true
    },
    controls: {
      expanded: true
    }
  },
  argTypes: {
    playerRole: {
      name: 'View as',
      defaultValue: allRoles[0],
      control: {
        type: 'select',
        options: allRoles
      }
    },
    gameTurnTime: {
      name: 'Turn Length',
      defaultValue: (overview.gameTurnTime as MilliTurns).millis,
      control: {
        type: 'radio',
        options: [
          120000, 240000, 300000, 600000
        ]
      }
    },
    phase: {
      name: 'Game phase',
      defaultValue: Phase.Planning,
      control: {
        type: 'radio',
        options: [
          Phase.Planning,
          Phase.Adjudication
        ]
      }
    },
    wargameInitiated: {
      name: 'Wargame has been initiated',
      control: {
        type: 'boolean'
      }
    },
    children: {
      table: {
        disable: true
      }
    }
  }
}

const largerMapping = deepCopy(mapping)

const localConstraints: MappingConstraints = deepCopy(largerMapping)

const fixIndex = (index: string, res: number): string => {
  return h3ToParent(index, res)
}
const cleanRoute = (route: RouteTurn[], res: number): RouteTurn[] => {
  return route.map((turn: RouteTurn): RouteTurn => {
    const fixedCells = turn.route && turn.route.map((index: string) => {
      return fixIndex(index, res)
    })
    const deDupe = uniq(fixedCells)
    return {
      turn: turn.turn,
      route: deDupe,
      status: turn.status
    }
  })
}

// fix the locations
// enable the next line to use code to transform cells to lower
// resolution
const lowerResolution = false
lowerResolution && forces.forEach((force: ForceData) => {
  force.assets && force.assets.forEach((asset: Asset) => {
    if (asset.position) {
      asset.position = fixIndex(asset.position, localConstraints.h3res)
    }
    if (asset.plannedTurns) {
      asset.plannedTurns = cleanRoute(asset.plannedTurns, localConstraints.h3res)
    }
    if (asset.history) {
      asset.history = cleanRoute(asset.history, localConstraints.h3res)
    }
  })
})
// output wargame as JSON, to update wargame
lowerResolution && console.log(JSON.stringify(wargame))

const mapPostBack = (messageType: string, payload: MessageMap, channelID?: string | number | undefined): void => {
  console.log('index7 postBack', messageType, payload, channelID)
}

interface StoryPropTypes extends MappingPropTypes {
  showAllowableCells?: boolean
  allowableOrigin?: string
  allowableTerrain?: string
  mappingConstraints: MappingConstraints
}

const Template: Story<StoryPropTypes> = (args) => {
  const {
    playerRole,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    playerForce,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isGameControl,
    phase,
    gameTurnTime,
    isUmpire,
    ...props
  } = args
  const roleStr: string = playerRole || ''
  // separate out the two elements of the combined role
  const ind = roleStr.indexOf(' ~ ')
  const force = roleStr.substring(0, ind)
  const role = roleStr.substring(ind + 3)
  const isGameControlRole = roleStr === allRoles[0]
  if (isUmpire && ind === 143) {
    console.log('keep compiler happy, one linter needs isUmpire to be defined, another says it\'s unused')
  }
  const isUmpireForce = isGameControlRole
  return (
    <Mapping
      playerForce={force}
      gameTurnTime={gameTurnTime}
      isGameControl={isGameControlRole}
      isUmpire={isUmpireForce}
      playerRole={role}
      fetchOverride={fetchMock}
      phase={phase}
      mapPostBack={mapPostBack}
      {...props}
    />
  )
}

/**
 * DEFAULT VIEW
 */
export const P9Trials = Template.bind({})
P9Trials.args = {
  forces: forces,
  platforms: platformTypes,
  infoMarkers: annotations,
  markerIcons: icons,
  channel: mapChannel,
  wargameInitiated: true,
  turnNumber: 5,
  mapBar: true,
  mappingConstraints: localConstraints,
  children: (
    <>
      <HexGrid />
      <Assets />
      <InfoMarkers />
    </>
  )
}