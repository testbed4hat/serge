export default {
  "type": "object",
  "properties": {
    "TurnNumber": {
      "title": "Turn",
      "type": "string",
      "format": "number"
    },
    "OverallIntentions": {
      "title": "Overall intentions",
      "type": "string",
      "format": "textarea"
    },
    "Orders": {
      "items": {
        "properties": {
          "Unit": {
            "title": "Unit",
            "type": "string",
            "format": "text"
          },
          "Tasking": {
            "title": "Tasking",
            "type": "string",
            "format": "textarea"
          },
          "SearchPolicy": {
            "title": "Search Policy",
            "type": "string",
            "format": "textarea"
          },
          "ActionOnContact": {
            "title": "Action on Contact",
            "type": "string",
            "enum": [
              "Ignore",
              "Evade",
              "Covert Trail",
              "Overt Trail",
              "Harass"
            ]
          },
          "AnyOtherComments": {
            "title": "Any other comments",
            "type": "string",
            "format": "textarea"
          }
        },
        "type": "object"
      },
      "title": "Orders",
      "type": "array",
      "format": "table",
      "minItems": 1
    }
  },
  "title": "Daily Intent",
  "required": [
    "OverallIntentions",
    "Orders"
  ]
}
