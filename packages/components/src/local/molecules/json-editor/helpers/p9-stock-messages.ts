import { TemplateBody } from '@serge/custom-types'

const p9StockTemplates: TemplateBody[] = [
  {
    lastUpdated: '2019-09-30T12:37:26.705Z',
    title: 'Adjudication Feedback',
    details: {
      $id: 'https://example.com/arrays.schema.json',
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: 'Outcomes from a set of orders',
      type: 'object',
      title: 'Adjudication Outcomes',
      format: 'grid',
      required: [
        'narrative'
      ],
      properties: {
        Reference: {
          title: 'Reference',
          propertyOrder: 10,
          readonly: true,
          type: 'string'
        },
        narrative: {
          title: 'General Feedback',
          propertyOrder: 20,
          type: 'string',
          format: 'textarea'
        },
        location: {
          title: 'Location',
          propertyOrder: 30,
          type: 'string'
        },
        perceptionOutcomes: {
          type: 'array',
          title: 'Perception Outcomes',
          propertyOrder: 40,
          format: 'table',
          additionalProperties: false,
          items: {
            title: 'Perception Outcome',
            type: 'object',
            required: [
              'force',
              'asset'
            ],
            properties: {
              force: {
                title: 'By',
                propertyOrder: 10,
                type: 'string',
                enum: [
                  'f-a',
                  'f-b',
                  'f-c',
                  'f-d'
                ],
                options: {
                  enum_titles: [
                    'Red',
                    'Blue',
                    'White',
                    'Green'
                  ],
                  grid_columns: 3
                }
              },
              asset: {
                title: 'Asset',
                propertyOrder: 20,
                type: 'string',
                enum: [
                  'ta',
                  'tb',
                  'tc',
                  'pa'
                ],
                options: {
                  enum_titles: [
                    'Tank A',
                    'Tank B',
                    'Tank C',
                    'Plane A'
                  ],
                  grid_columns: 3
                }
              },
              perceivedForce: {
                title: 'Force',
                propertyOrder: 30,
                type: 'string',
                enum: [
                  'Unknown',
                  'Blue',
                  'Red',
                  'Green',
                  'White'
                ],
                options: {
                  grid_columns: 3
                }
              },
              perceivedType: {
                title: 'Platform Type',
                propertyOrder: 40,
                type: 'string',
                enum: [
                  'Unknown',
                  'Tank',
                  'Frigate',
                  'Fighter',
                  'Destroyer'
                ],
                options: {
                  grid_columns: 3
                }
              },
              health: {
                title: 'Health',
                propertyOrder: 50,
                type: 'string',
                enum: [
                  'Unknown',
                  '100',
                  '75',
                  '50',
                  '25',
                  '0'
                ],
                options: {
                  grid_columns: 3
                }
              },
              perceivedName: {
                title: 'Name',
                propertyOrder: 60,
                type: 'string'
              },
              narrative: {
                title: 'Comment',
                propertyOrder: 70,
                type: 'string',
                format: 'textarea'
              },
              private: {
                title: 'Private',
                propertyOrder: 80,
                type: 'string',
                format: 'textarea'
              }
            }
          }
        },
        healthOutcomes: {
          type: 'array',
          format: 'table',
          propertyOrder: 50,
          title: 'Health Outcomes',
          additionalProperties: false,
          items: {
            title: 'Health Outcome',
            type: 'object',
            required: [
              'asset',
              'health'
            ],
            properties: {
              asset: {
                title: 'Asset',
                type: 'string',
                enum: [
                  'ta',
                  'tb',
                  'tc',
                  'pa'
                ],
                options: {
                  enum_titles: [
                    'Tank A',
                    'Tank B',
                    'Tank C',
                    'Plane A'
                  ],
                  grid_columns: 3
                }
              },
              health: {
                title: 'Condition',
                type: 'string',
                enum: [
                  '100',
                  '75',
                  '50',
                  '25',
                  '0'
                ],
                options: {
                  grid_columns: 3
                }
              },
              narrative: {
                title: 'Comment',
                type: 'string',
                format: 'textarea'
              },
              private: {
                title: 'Private',
                type: 'string',
                format: 'textarea'
              }
            }
          }
        },
        locationOutcomes: {
          type: 'array',
          format: 'table',
          propertyOrder: 60,
          title: 'Movement Outcomes',
          additionalProperties: false,
          items: {
            title: 'Movement Outcome',
            type: 'object',
            required: [
              'asset',
              'location'
            ],
            properties: {
              asset: {
                title: 'Asset',
                type: 'string',
                enum: [
                  'ta',
                  'tb',
                  'tc',
                  'pa'
                ],
                options: {
                  enum_titles: [
                    'Tank A',
                    'Tank B',
                    'Tank C',
                    'Plane A'
                  ],
                  grid_columns: 3
                }
              },
              location: {
                title: 'Location',
                type: 'string',
                enum: [
                  'Point A',
                  'Point B',
                  'Point C'
                ],
                options: {
                  grid_columns: 3
                }
              },
              narrative: {
                title: 'Comment',
                type: 'string',
                format: 'textarea'
              },
              private: {
                title: 'Private',
                type: 'string',
                format: 'textarea'
              }
            }
          }
        }
      }
    },
    completed: false,
    _id: 'p9adjudicate',
    _rev: '1-7fa1e6dd6b4ac5b6afc45b596ee7af61'
  },
  {
    lastUpdated: '2019-09-30T12:37:26.705Z',
    title: 'Chat',
    details: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          format: 'textarea',
          options: {
            inputAttributes: {
              placeholder: 'type the text'
            }
          }
        }
      },
      title: 'Chat',
      format: 'grid'
    },
    completed: false,
    _id: 'k16eedkl',
    _rev: '1-09ab7a18ff677cec5d9a56f02a45788d'
  }
]
export default p9StockTemplates