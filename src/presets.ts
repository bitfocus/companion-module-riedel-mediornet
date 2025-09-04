import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import { DeviceState } from './state'
import { ActionId } from './actions'
import { FeedbackId } from './feedback'

export function GetPresetsList(state: DeviceState): CompanionPresetDefinitions {
  const presets: CompanionPresetDefinitions = {}

  presets['take'] = {
    category: 'Generic Actions',
    name: 'Take',
    type: 'button',
    style: {
      text: 'Take',
      size: '18',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 0, 0),
    },
    feedbacks: [
      {
        feedbackId: 'take',
        style: {
          bgcolor: combineRgb(255, 0, 0),
          color: combineRgb(255, 255, 255),
        },
        options: {},
      },
    ],
    steps: [
      {
        down: [
          {
            actionId: 'take',
            options: {},
          },
        ],
        up: [],
      },
    ],
  }

  presets['clear'] = {
    category: 'Generic Actions',
    name: 'Clear',
    type: 'button',
    style: {
      text: 'Clear',
      size: '18',
      color: combineRgb(128, 128, 128),
      bgcolor: combineRgb(0, 0, 0),
    },
    feedbacks: [
      {
        feedbackId: 'clear',
        style: {
          bgcolor: combineRgb(255, 255, 255),
          color: combineRgb(255, 0, 0),
        },
        options: {},
      },
    ],
    steps: [
      {
        down: [
          {
            actionId: 'clear',
            options: {},
          },
        ],
        up: [],
      },
    ],
  }

  presets['undo'] = {
    category: 'Generic Actions',
    name: 'Undo',
    type: 'button',
    style: {
      text: 'Undo\n$(mediornet:selected_target_undo_source)',
      size: '18',
      color: combineRgb(0, 0, 255),
      bgcolor: combineRgb(0, 0, 0),
    },
    feedbacks: [
      {
        feedbackId: 'undo',
        style: {
          bgcolor: combineRgb(0, 0, 255),
          color: combineRgb(0, 0, 0),
        },
        options: {},
      },
    ],
    steps: [
      {
        down: [
          {
            actionId: 'undo',
            options: {},
          },
        ],
        up: [],
      },
    ],
  }

  presets['select_source_rotary'] = {
    category: 'Generic Actions',
    name: 'Source Select Rotary',
    type: 'button',
    style: {
      text: 'Select Source Rotary',
      size: '14',
      color: combineRgb(0, 255, 255),
      bgcolor: combineRgb(0, 0, 0),
    },
    options: {
      rotaryActions: true
    },
    feedbacks: [],
    steps: [
      {
        down: [],
        up: [],
        rotate_left: [
          {
            actionId: 'select_source',
            options: {
              next_previous_action: true,
              next_previous: 'previous'
            },
          },
        ],
        rotate_right: [
          {
            actionId: 'select_source',
            options: {
              next_previous_action: true,
              next_previous: 'next'
            },
          },
        ],
      },
    ],
  }

  presets['select_target_rotary'] = {
    category: 'Generic Actions',
    name: 'Source Target Rotary',
    type: 'button',
    style: {
      text: 'Select Target Rotary',
      size: '14',
      color: combineRgb(0, 255, 255),
      bgcolor: combineRgb(0, 0, 0),
    },
    options: {
      rotaryActions: true
    },
    feedbacks: [],
    steps: [
      {
        down: [],
        up: [],
        rotate_left: [
          {
            actionId: 'select_target',
            options: {
              next_previous_action: true,
              next_previous: 'previous'
            },
          },
        ],
        rotate_right: [
          {
            actionId: 'select_target',
            options: {
              next_previous_action: true,
              next_previous: 'next'
            },
          },
        ],
      },
    ],
  }

  for (const matrix of state.matrices) {
    presets[`select_matrix_${matrix.variableName}`] = {
      previewStyle: {
        text: 'Select ' + matrix.label + ' Matrix',
        size: 14,
        color: combineRgb(255,255,255),
        bgcolor: combineRgb(0,0,0)
      },
      category: 'Generic Actions',
      name: 'Selection of matrix',
      type: 'button',
      style: {
        text: matrix.label,
        size: 18,
        color: combineRgb(255,255,255),
        bgcolor: combineRgb(0,0,0)
      },
      feedbacks: [
        {
          feedbackId: FeedbackId.SelectedMatrix,
          style: {
            bgcolor: combineRgb(0,0, 255),
            color: combineRgb(255,255,255)
          },
          options: {
            matrix: matrix.id
          },
        },
      ],
      steps: [
        {
          down: [
            {
              actionId: ActionId.SetMatrix,
              options: {
                matrix: matrix.id,
              }
            }
          ],
          up: [],
        }
      ]
    }

    state.iterateOutputs(matrix.id).forEach((output, key) => {

        state.iterateInputs(matrix.id).forEach((input, key) => {
          if (input != undefined && input.active) {
            presets[`route_source_${matrix.variableName}_${key}`] = {
              category: matrix.label + ' Select Source',
              name: `Route ${input.name} to selected destination`,
              type: 'button',
              style: {
                text: `$(mediornet:input_${matrix.variableName}_${key + 1})`,
                size: '18',
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 0),
              },
              feedbacks: [
                {
                  feedbackId: 'selected_source',
                  style: {
                    bgcolor: combineRgb(255, 255, 255),
                    color: combineRgb(0, 0, 0),
                  },
                  options: {
                    matrix: matrix.id,
                    [`source_${matrix.id}`]: key,
                  },
                },
                {
                  feedbackId: 'take_tally_source',
                  style: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(255, 255, 255),
                  },
                  options: {
                    matrix: matrix.id,
                    [`source_${matrix.id}`]: key,
                  },
                },
              ],
              steps: [
                {
                  down: [
                    {
                      actionId: 'select_source',
                      options: {
                        matrix: matrix.id,
                        [`source_${matrix.id}`]: key,
                      },
                    },
                  ],
                  up: [],
                },
              ],
            }
          }
        })

      if (output != undefined && output.active) {
        presets[`select_destination_${matrix.variableName}_${key}`] = {
          category: matrix.label + ' Select Target',
          name: `Selection destination button for ${output.name}`,
          type: 'button',
          style: {
            text: `$(mediornet:output_${matrix.variableName}_${key + 1})`,
            size: '18',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 0),
          },
          feedbacks: [
            {
              feedbackId: 'selected_target',
              style: {
                bgcolor: combineRgb(255, 255, 0),
                color: combineRgb(0, 0, 0),
              },
              options: {
                matrix: matrix.id,
                [`target_${matrix.id}`]: key,
              },
            },
          ],
          steps: [
            {
              down: [
                {
                  actionId: 'select_target',
                  options: {
                    matrix: matrix.id,
                    [`target_${matrix.id}`]: key,
                  },
                },
              ],
              up: [],
            },
          ],
        }
      }
    })
  }

  return presets
}
