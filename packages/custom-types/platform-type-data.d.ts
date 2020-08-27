import States from './states'

export default interface PlatformTypeData {
  name: string,
  conditions: Array<string>,
  icon: string,
  speedKts: Array<number>,
  states: Array<States>
  travelMode: string
}
