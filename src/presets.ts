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
    for (const output of state.iterateOutputs(matrix.id)) {
      if (output != undefined && output.active) {
        presets[`select_destination_${matrix.label}_${output.id}`] = {
          category: matrix.label.toUpperCase() + ' Select Destination (X)',
          name: `Selection destination button for ${output.name}`,
          type: 'button',
          style: {
            text: `$(mediornet:output_${matrix.label}_${output.id + 1})`,
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
                target: output.id,
              },
            } /*,
          {
            feedbackId: 'take_tally_dest',
            options: {
              bg: combineRgb(255, 0, 0),
              fg: combineRgb(255, 255, 255),
              output: output.id,
            },
          }*/,
          ],
          steps: [
            {
              down: [
                {
                  actionId: 'select_target_' + matrix.label,
                  options: {
                    target: output.id,
                  },
                },
              ],
              up: [],
            },
          ],
        }
      }
    }

    for (const input of state.iterateInputs(matrix.id)) {
      if (input != undefined && input.active) {
        presets[`route_source_${matrix.label}_${input.id}`] = {
          category: matrix.label.toUpperCase() + ' Route Source (Y)',
          name: `Route ${input.name} to selected destination`,
          type: 'button',
          style: {
            text: `$(mediornet:input_${matrix.label}_${input.id + 1})`,
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
                source: input.id,
              },
            },
            {
              feedbackId: 'take_tally_source_' + matrix.label,
              style: {
                bgcolor: combineRgb(255, 0, 0),
                color: combineRgb(255, 255, 255),
              },
              options: {
                source: input.id,
              },
            },
          ],
          steps: [
            {
              down: [
                {
                  actionId: 'select_source_' + matrix.label,
                  options: {
                    source: input.id,
                  },
                },
              ],
              up: [],
            },
          ],
        }
      }
    }
    /*
        for (const output of state.iterateOutputs(matrix.id)) {
          for (const input of state.iterateInputs(matrix.id)) {
            presets[`output_${matrix.label}_${output.id}_${input.id}`] = {
              category: `Output ${matrix.label} ${output.id + 1}`,
              name: `Output ${output.id + 1} button for ${input.name}`,
              type: 'button',
              style: {
                text: `$(mediornet:input_${input.id + 1})`,
                size: '18',
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 0),
              },
              feedbacks: [
                {
                  feedbackId: 'input_bg',
                  options: {
                    bg: combineRgb(255, 255, 0),
                    fg: combineRgb(0, 0, 0),
                    input: input.id,
                    output: output.id,
                  },
                },
              ],
              steps: [
                {
                  down: [
                    {
                      actionId: 'route',
                      options: {
                        source: input.id,
                        destination: output.id,
                      },
                    },
                  ],
                  up: [],
                },
              ],
            }

            presets[`output_${output.id}_${input.id}_momentary`] = {
              category: `Output ${output.id + 1} (momentary)`,
              name: `Output ${output.id + 1} button for ${input.name} with route back`,
              type: 'button',
              style: {
                text: `$(mediornet:input_${input.id + 1}) (mom.)`,
                size: '18',
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 0),
              },
              feedbacks: [
                {
                  feedbackId: 'input_bg',
                  options: {
                    bg: combineRgb(255, 255, 0),
                    fg: combineRgb(0, 0, 0),
                    input: input.id,
                    output: output.id,
                  },
                },
              ],
              steps: [
                {
                  down: [
                    {
                      actionId: 'route',
                      options: {
                        source: input.id,
                        destination: output.id,
                      },
                    },
                  ],
                  up: [
                    {
                      actionId: 'route_to_previous',
                      options: {
                        destination: output.id,
                      },
                    },
                  ],
                },
              ],
            }
          }
        }

     */
  }

  return presets
}
