import L from 'leaflet'
import React from 'react'
import { withKnobs, number, radios } from '@storybook/addon-knobs'
import { forces } from './mocks/forces'

// import tileSize from '../hex-grid/knobs/tile-size'

// Import component files
import Mapping from './index'
import docs from './README.md'
import AssetIcon from '../asset-icon'
import Assets from '../assets'
import { HexGrid } from '../hex-grid'
import Dialogue from '../dialogue'

// import data types
import { Phase } from './types/phase'

export default {
  title: 'local/Mapping',
  component: Mapping,
  decorators: [withKnobs],
  parameters: {
    readme: {
      // Show readme before story
      content: docs
    },
    options: {
      // We have no addons enabled in this story, so the addon panel should be hidden
      showPanel: false
    }
  }
}

const bounds = {
  imageTop: 14.194809302,
  imageLeft: 42.3558566271,
  imageRight: 43.7417816271,
  imageBottom: 12.401259302
}

const LocalTileLayer = {
  url: '/tiles/{z}/{x}/{y}.png',
  attribution: 'Generated by QTiles'
}

const OSMTileLayer = {
  url: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
  attribution: 'Data © <a href="http://osm.org/copyright">OpenStreetMap</a>'
}

/**
 * DEFAULT VIEW
 */

export const Default: React.FC = () => <Mapping
  tileDiameterMins = {5}
  bounds = {bounds}
  tileLayer = {LocalTileLayer}
  forces = {forces}
  playerForce = 'Blue'
  phase = {Phase.Planning}
/>

/**
 * VIEW WITH SINGLE ASSET
 */
export const WithMarker: React.FC = () => <Mapping
  tileDiameterMins = {5}
  bounds = {bounds}
  tileLayer = {LocalTileLayer}
  forces = {forces}
  playerForce = 'Blue'
  phase = {Phase.Planning}
>
  <AssetIcon position={L.latLng(13.298034302, 43.0488191271)} type="agi" force="blue" tooltip="Tooltip for marker">
    <Dialogue headerText="This is a test">This is the content of the dialogue</Dialogue>
  </AssetIcon>
</Mapping>

/**
 * VIEW WITH MULTIPLE ASSETS
 */
const label = 'View As'
const forceNames = {
  White: 'umpire',
  Blue: 'Blue',
  Red: 'Red'
}
const defaultValue = 'Blue'

export const WithAssets: React.FC = () => <Mapping
  tileDiameterMins = {5}
  bounds = {bounds}
  tileLayer = {LocalTileLayer}
  forces={forces}
  playerForce={radios(label, forceNames, defaultValue)}
  phase = {Phase.Planning}
>
  <Assets />
</Mapping>

// @ts-ignore TS belives the 'story' property doesn't exist but it does.
WithAssets.story = {
  parameters: {
    options: {
      // This story requires addons but other stories in this component do not
      showPanel: true
    }
  }
}

/**
 * VIEW WITH HEX GRID
 */
const hexGridLabel = 'Tile diameter, nm'
const hexGridDefaultValue = 5
const hexGridOptions = {
  range: true,
  min: 1,
  max: 15,
  step: 1
}

export const WithGrid: React.FC = () => <Mapping
  bounds = {bounds}
  tileLayer = {LocalTileLayer}
  tileDiameterMins={number(hexGridLabel, hexGridDefaultValue, hexGridOptions)}
  forces={forces}
  phase = {Phase.Planning}
  playerForce='Blue'>
  <HexGrid />
</Mapping>

// @ts-ignore TS belives the 'story' property doesn't exist but it does.
WithGrid.story = {
  parameters: {
    options: {
      // This story requires addons but other stories in this component do not
      showPanel: true
    }
  }
}

/**
 * VIEW WITH OPEN STREET MAP
 */
export const OpenStreetMap: React.FC = () => <Mapping
  tileDiameterMins = {5}
  bounds = {bounds}
  tileLayer = {OSMTileLayer}
  forces={forces}
  playerForce='Blue'
  phase = {Phase.Planning}
/>

/**
 * VIEW ALLOWING GAME PHASE & PLAYER FORCE TO CHANGE
 * (with the intention of verifyin that the correct form is displayed)
 */
const phasesViewLabel = 'View As'
const phasesViewNames = {
  White: 'umpire',
  Blue: 'Blue',
  Red: 'Red'
}
const phaseViewValue = 'Blue'

const phasesPhaseLabel = 'View As'
const phasesPhaseNames = {
  Planning: Phase.Planning,
  Adjudication: Phase.Adjudication
}
const phasePhaseValue = Phase.Planning

export const WithPhases: React.FC = () => <Mapping
  tileDiameterMins = {5}
  bounds = {bounds}
  tileLayer = {LocalTileLayer}
  forces={forces}
  playerForce={radios(phasesViewLabel, phasesViewNames, phaseViewValue)}
  phase={radios(phasesPhaseLabel, phasesPhaseNames, phasePhaseValue)}
>
  <Assets />
</Mapping>

// @ts-ignore TS belives the 'story' property doesn't exist but it does.
WithPhases.story = {
  parameters: {
    options: {
      // This story requires addons but other stories in this component do not
      showPanel: true
    }
  }
}
