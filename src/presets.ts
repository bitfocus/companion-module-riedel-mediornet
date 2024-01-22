import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import { MediornetState } from './state'

export function GetPresetsList(state: MediornetState): CompanionPresetDefinitions {
  const presets: CompanionPresetDefinitions = {}

  presets['take'] = {
    category: 'Actions\n(XY only)',
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
    category: 'Actions\n(XY only)',
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
    category: 'Actions\n(XY only)',
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

  for (const matrix of state.matrices) {
    state.iterateOutputs(matrix.id).forEach((output, key) => {
      if (output != undefined && output.active) {
        presets[`select_destination_${matrix.label}_${key}`] = {
          category: matrix.label.toUpperCase() + ' Select Destination (X)',
          name: `Selection destination button for ${output.name}`,
          type: 'button',
          style: {
            text: `$(mediornet:output_${matrix.label}_${key + 1})`,
            size: '18',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 0),
          },
          feedbacks: [
            {
              feedbackId: 'selected_target_' + matrix.label,
              style: {
                bgcolor: combineRgb(255, 255, 0),
                color: combineRgb(0, 0, 0),
              },
              options: {
                target: key,
              },
            },
          ],
          steps: [
            {
              down: [
                {
                  actionId: 'select_target_' + matrix.label,
                  options: {
                    target: key,
                  },
                },
              ],
              up: [],
            },
          ],
        }
      }
    }
    )

    state.iterateInputs(matrix.id).forEach((input, key) => {
      if (input != undefined && input.active) {
        presets[`route_source_${matrix.label}_${key}`] = {
          category: matrix.label.toUpperCase() + ' Route Source (Y)',
          name: `Route ${input.name} to selected destination`,
          type: 'button',
          style: {
            text: `$(mediornet:input_${matrix.label}_${key + 1})`,
            size: '18',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 0),
          },
          feedbacks: [
            {
              feedbackId: 'selected_source_' + matrix.label,
              style: {
                bgcolor: combineRgb(255, 255, 255),
                color: combineRgb(0, 0, 0),
              },
              options: {
                source: key,
              },
            },
            {
              feedbackId: 'take_tally_source_' + matrix.label,
              style: {
                bgcolor: combineRgb(255, 0, 0),
                color: combineRgb(255, 255, 255),
              },
              options: {
                source: key,
              },
            },
          ],
          steps: [
            {
              down: [
                {
                  actionId: 'select_source_' + matrix.label,
                  options: {
                    source: key,
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
