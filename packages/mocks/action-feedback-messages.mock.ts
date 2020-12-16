import { SET_FEEDBACK_MESSAGES, FEEDBACK_MESSAGE } from '@serge/config'
import { PlayerUiActionTypes } from '@serge/custom-types'
const setAllFeedbackMessagesActoin: PlayerUiActionTypes = {
  "type": SET_FEEDBACK_MESSAGES,
  "payload": [
    {
      "details": {
        "channel": "Feedback",
        "from": {
          "force": "Blue",
          "forceColor": "#3dd0ff",
          "role": "CO",
          "name": "",
          "icon": ''
        },
        "messageType": "Chat",
        "timestamp": "2020-12-06T11:05:12.038Z"
      },
      "message": {
        "content": "ds"
      },
      messageType: FEEDBACK_MESSAGE,
      // "feedback": true, we don't need it more
      "_id": "2020-12-06T11:05:12.038Z",
      "_rev": "1-5201037a26e24f70ae45464c20b312aa"
    },
    {
      "details": {
        "channel": "Feedback",
        "from": {
          "force": "White",
          "forceColor": "#FCFBEE",
          "role": "Game Control",
          "name": "Heri Setiawan",
          "icon": ''
        },
        "messageType": "Chat",
        "timestamp": "2020-10-01T01:19:56.492Z"
      },
      "message": {
        "content": "Lorem ipsum do lor sit amet"
      },
      messageType: FEEDBACK_MESSAGE,
      // "feedback": true, we don't need it more
      "_id": "2020-10-01T01:19:56.492Z",
      "_rev": "1-1e2289c6ee47e2dfd1ffb7e84f66514f"
    }
  ]
}
