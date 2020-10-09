export default interface Message {
  details: {
    /** id of channel message sent from */
    channel: string,
    /** details of author */
    from: {
      /** id of user force
       * TODO: check we're using id, not force name
       */
      force: string,
      /** CSS color shade for this force */
      forceColor: string,
      /** role of the individual that wrote message */
      role: string,
      /** URL of icon to display for this force
       * TODO: once all code under TypeScript try making it non-optional,
       * and fix cases where it's not assigned
       */
      icon: string
      /** user-name, as typed into Feedback/insights form */
      name?: string
    }
    messageType: string,
    timestamp: string,
  },
  message: {
    /** TODO: Ian thinks could be a structure for formatted messages. This Message
     * type is initially just being used for Admin messages - which are pure chat.
     * Once we have in-game messages, we should encounter structured messages
     */
    content: string
  },
  open: boolean,
  isOpen: boolean
  hasBeenRead: boolean
  _id: string
}