import MappingConstraints from "./mapping-constraints";
import { TurnFormats } from "@serge/config"

export default interface WargameOverview {
  /** title for this wargame */
  name: string,
  /** high level description of wargame */
  gameDescription: string,
  /** form for displaying turn number */
  turnPresentation?: TurnFormats,
  /** how far game time moves forward on each step */
  gameTurnTime: number,
  /** the time allowed for player planning */
  realtimeTurnTime: number,
  /** when to display "not much time remaining" warning */
  timeWarning: number,
  /** date-time of start of game */
  gameDate: string,
  /** allow easy login, during game development/test */
  showAccessCodes: boolean,
  /** whether all necessary data for this page is complete */
  complete: boolean,
  /** whether this page has unsaved edits */
  dirty: boolean
  /** dimensions of the map */
  mapConstraints?: MappingConstraints
}