// import data types
import { CellLabelStyle, Phase, serverPath } from 'src/config'
import { ChannelMapping, ChannelTypes, ForceData, MappingConstraints, Role } from 'src/custom-types'
import { deepCopy } from 'src/Helpers'
/* Import mock data */
import { cmdWkWargame } from 'src/mocks'
import { Story } from '@storybook/react/types-6-0'
import React from 'react'
import Assets from '../assets'
import { HexGrid } from '../hex-grid'
import data from './data/atlantic-cells'
// Import component files
import Mapping from './index'
import docs from './README.md'
import MappingPropTypes from './types/props'

// TODO: here is the 'master' version of the cells,
// in the @serge/data package
// import * as data from '../../../../../data/atlantic-cells.json'

const atlanticForces = cmdWkWargame.data.forces.forces
const platformTypes = cmdWkWargame.data.platformTypes ? cmdWkWargame.data.platformTypes.platformTypes : []
const mapChannel = cmdWkWargame.data.channels.channels.find((channel: ChannelTypes) => channel.name === 'mapping') as ChannelMapping

const wrapper: React.FC = (storyFn: any) => <div style={{ height: '700px' }}>{storyFn()}</div>

const fetchMock = async (): Promise<any> => {
  return {
    json: (): any => data
  }
}

const allRoles: string[] = []
atlanticForces.forEach((force: ForceData) => {
  force.roles.forEach((role: Role) => {
    allRoles.push(force.uniqid + ' ~ ' + role.roleId)
  })
})

export default {
  title: 'local/Mapping/Atlantic',
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
    phase: {
      name: 'Game phase',
      control: {
        type: 'radio',
        defaultValue: Phase.Planning,
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

const atlanticConstraints: MappingConstraints = {
  bounds: [
    [
      75,
      -90.0
    ],
    [
      30,
      30
    ]
  ],
  cellLabelsStyle: CellLabelStyle.X_Y_LABELS,
  maxZoom: 10,
  minZoom: 3,
  h3res: 3,
  gridCellsURL: `${serverPath}cells/atlantic-cells-6k.json`,
  polygonAreasURL: `${serverPath}cells/atlantic-polygons.json`
}

const localConstraints: MappingConstraints = deepCopy(atlanticConstraints)
localConstraints.tileLayer = {
  url: './atlantic_tiles/{z}/{x}/{y}.png',
  maxNativeZoom: 7,
  attribution: 'Generated by QTiles'
}

const osmConstraints: MappingConstraints = deepCopy(atlanticConstraints)
osmConstraints.tileLayer = {
  url: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
  maxNativeZoom: 17,
  attribution: 'Data © <a href="http://osm.org/copyright">OpenStreetMap</a>'
}

const detailedConstraints: MappingConstraints = deepCopy(atlanticConstraints)
detailedConstraints.tileLayer = {
  maxNativeZoom: 7,
  url: './atlantic_tiles/{z}/{x}/{y}.png',
  attribution: 'Generated by QTiles'
}
detailedConstraints.gridCellsURL = `${serverPath}atlantic-detailed.json`

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
    ...props
  } = args
  const roleStr: string = playerRole || ''
  // separate out the two elements of the combined role
  const ind = roleStr.indexOf(' ~ ')
  const force = roleStr.substring(0, ind)
  const role = roleStr.substring(ind + 3)
  const isGameControlRole = roleStr === allRoles[0]
  return (
    <Mapping
      playerForce={force}
      isGameControl={isGameControlRole}
      playerRole={role}
      fetchOverride={fetchMock}
      {...props}
    />
  )
}

const twoFourHours = 1000 * 60 * 60 * 24

/**
 * DEFAULT VIEW
 */
export const NaturalEarth = Template.bind({})
NaturalEarth.args = {
  forces: atlanticForces,
  playerForce: 'Blue',
  gameTurnTime: { unit: 'millis', millis: twoFourHours },
  isGameControl: true,
  isUmpire: true,
  platforms: platformTypes,
  markerIcons: [],
  channel: mapChannel,
  phase: Phase.Planning,
  wargameInitiated: true,
  turnNumber: 5,
  mapBar: true,
  mappingConstraints: localConstraints,
  children: (
    <>
      <HexGrid />
      <Assets />
    </>
  )
}

export const OpenStreetMap = Template.bind({})
OpenStreetMap.args = {
  forces: atlanticForces,
  playerForce: 'Blue',
  gameTurnTime: { unit: 'millis', millis: twoFourHours },
  isGameControl: true,
  isUmpire: true,
  platforms: platformTypes,
  wargameInitiated: true,
  markerIcons: [],
  channel: mapChannel,
  phase: Phase.Planning,
  turnNumber: 5,
  mapBar: true,
  mappingConstraints: osmConstraints,
  children: (
    <>
      <Assets />
      <HexGrid />
    </>
  )
}

export const DetailedCells = Template.bind({})
DetailedCells.args = {
  forces: atlanticForces,
  playerForce: 'Blue',
  gameTurnTime: { unit: 'millis', millis: twoFourHours },
  isGameControl: true,
  isUmpire: true,
  platforms: platformTypes,
  markerIcons: [],
  channel: mapChannel,
  phase: Phase.Planning,
  wargameInitiated: true,
  turnNumber: 5,
  mapBar: true,
  mappingConstraints: detailedConstraints,
  children: (
    <>
      <HexGrid />
      <Assets />
    </>
  )
}
