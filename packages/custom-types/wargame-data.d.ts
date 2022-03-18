import Channel from './channel'
import Force from './force'
import WargameOverview from './wargame-overview'
import PlatformType from './platform-type'
import { MapAnnotations } from './map-annotation'

export default interface WargameData {
  overview: WargameOverview,
  forces: Force,
  channels: Channel,
  platformTypes?: PlatformType
  annotations?: MapAnnotations
}
