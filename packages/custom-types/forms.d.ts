import { AttributeTypes, ForceData } from '.'
import ForceOption from './color-option'
import { AttributeValues } from './attributes'
import SergeHex from './serge-hex'
import { SergeHex3 } from './serge-hex-3'
import PlatformTypeData from './platform-type-data'

interface Status {
  name: string,
  mobile: boolean
}

interface Force {
  name: string,
  colour: string
}

export interface PerceivedType {
  name: PlatformTypeData['name']
  uniqid : PlatformTypeData['uniqid']
}

export interface PerceptionFormPopulate {
  perceivedForces: Array<ForceOption>
  perceivedTypes: Array<PerceivedType>
}

export interface PerceptionFormValues {
  perceivedNameVal: string
  perceivedForceClass: string
  perceivedForceName: ForceData['name']
  perceivedTypeId: PlatformTypeData['name'] | undefined
  assetId: string
  iconURL: PlatformTypeData['icon']
}

export interface PerceptionFormData {
  populate: PerceptionFormPopulate
  values: PerceptionFormValues
}

/** message for when player has planned new turn of data */
export interface NewTurnValues {
  state: string
  speed?: number
  route: Array<SergeHex3>
}

export interface PlanTurnFormPopulate {
  status: Array<Status>
  speed: Array<number>
  attributes: AttributeTypes
}

export interface PlanTurnFormValues {
  statusVal: Status
  speedVal: number
  turnsVal: number
  condition: string
  attributes: AttributeValues
}

export interface PlanTurnFormData {
  populate: PlanTurnFormPopulate
  values: PlanTurnFormValues
}

export interface AdjudicateTurnFormPopulate {
  contactId: string
  status: Array<Status>
  speed: Array<number>
  visibleTo: Array<ForceOption>
  condition: Array<string>
  attributes: AttributeTypes
}

export interface VisibilityFormData {
  assetId: string
  name: string
  contactId: string
  populate: Array<ForceOption>
  forceNames: Array<ForceData['name']>
  condition: Array<string>
  selectedCondition: string
}

/**
 * Data for icon generation
 */
 export interface IconDefinition {
  forceColor: string
  platformType: string
  icon: string
}