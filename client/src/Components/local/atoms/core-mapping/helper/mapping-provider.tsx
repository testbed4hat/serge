import { noop } from 'lodash'
import { createContext, useContext } from 'react'
import { PanelSize } from '../../../../../Components/CoreMappingChannel'

type MappingStateValue = {
  filterFeatureIds: string[]
  setFilterFeatureIds: (id: string[]) => void
  deselecteFeature: boolean
  setDeselectFeature: (selected: boolean) => void
  localPanelSize: PanelSize | undefined
  setLocalPanelSize: (oanelSize: PanelSize) => void
  isMeasuring: boolean
  setIsMeasuring: (isMeasuring: boolean) => void
  panTo: (lat: number, lng: number) => void
}

const initialState: MappingStateValue = {
  filterFeatureIds: [],
  setFilterFeatureIds: noop,
  deselecteFeature: false,
  setDeselectFeature: noop,
  localPanelSize: undefined,
  setLocalPanelSize: noop,
  isMeasuring: false,
  setIsMeasuring: noop,
  panTo: noop
}
const MappingState = createContext<MappingStateValue>(initialState)

export const MappingProvider = MappingState.Provider
export function useMappingState (): MappingStateValue {
  return useContext(MappingState)
}
