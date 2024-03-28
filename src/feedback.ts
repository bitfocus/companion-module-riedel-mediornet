import {
  CompanionFeedbackDefinition,
  CompanionFeedbackDefinitions,
  combineRgb,
  InstanceBase
} from '@companion-module/base'
import { DeviceConfig } from './config'
import { matrixnames, DeviceState } from './state'
import { getChoices } from './choices'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'

export enum FeedbackId {
  Take = 'take',
  Clear = 'clear',
  Undo = 'undo',
  SelectedSource = 'selected_source',
  SelectedTarget = 'selected_target',
  TakeTallySource = 'take_tally_source',
  RoutingTally = 'routing_tally',
  SelectedMatrix = 'selected_matrix',
}

/**
 * Returns all implemented Feedbacks.
 * @param _self reference to the BaseInstance
 * @param _emberClient reference to the emberClient
 * @param state reference to the state of the module
 * @constructor
 */
export function GetFeedbacksList(
  _self: InstanceBase<DeviceConfig>,
  _emberClient: EmberClient,
  state: DeviceState
): CompanionFeedbackDefinitions {
  const { inputChoices, outputChoices, matrixChoices } = getChoices(state)
  const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
    [FeedbackId.Take]: {
      name: 'Take is possible',
      description: 'Shows if there is take possible',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(255, 255, 255),
        color: combineRgb(255, 0, 0)
      },
      options: [],
      callback: () => {
        return (
          state.selected.target != -1 &&
          state.selected.source != -1 &&
          state.selected.matrix != -1 &&
          state.selected.source != state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route
        )
      }
    },
    [FeedbackId.Clear]: {
      name: 'Clear is possible',
      description: 'Returns true when a matrix, source or target is selected.',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(255, 255, 255),
        color: combineRgb(255, 0, 0)
      },
      options: [],
      callback: () => {
        return state.selected.target != -1 || state.selected.source != -1 || state.selected.matrix != -1
      }
    },
    [FeedbackId.Undo]: {
      name: 'Undo is possible',
      description: 'Changes Style if undo is possible on current target',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(0, 0, 255),
        color: combineRgb(0, 0, 0)
      },
      options: [],
      callback: () => {
        if (state.selected.matrix != -1 && state.selected.target != -1) {
          const selOut = state.matrices[state.selected.matrix].outputs.get(state.selected.target)
          return selOut?.fallback[selOut.fallback.length - 2] != undefined
        } else return false
      }
    },
    [FeedbackId.SelectedSource]: {
      name: 'Source Selected',
      description: 'Returns true when the picked source is currently selected.',
      type: 'boolean',
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0)
      },
      options: [
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.video].label} Source`,
          id: `source_${matrixnames.video}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video],
          isVisible: (options) => {
            return (options['matrix'] == 0)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.audio].label} Source`,
          id: `source_${matrixnames.audio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio],
          isVisible: options => {
            return (options['matrix'] == 1)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.data].label} Source`,
          id: `source_${matrixnames.data}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data],
          isVisible: options => {
            return (options['matrix'] == 2)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.multichannelaudio].label} Source`,
          id: `source_${matrixnames.multichannelaudio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio],
          isVisible: options => {
            return (options['matrix'] == 3)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.gpio].label} Source`,
          id: `source_${matrixnames.gpio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio],
          isVisible: options => {
            return (options['matrix'] == 4)
          }
        }
      ],
      callback: (feedback) => {
        let matrix = Number(feedback.options['matrix'])
        let source = Number(feedback.options[`source_${matrix}`])
        if (!Number.isNaN(matrix) && !Number.isNaN(source)) {
          return state.selected.source == source && state.selected.matrix == matrix
        } else return false
      }
    },
    [FeedbackId.SelectedTarget]: {
      name: 'Target Selected',
      description: 'Returns true when the picked target is currently selected.',
      type: 'boolean',
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0)
      },
      options: [
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.video].label} Target`,
          id: `target_${matrixnames.video}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.video],
          isVisible: (options) => {
            return (options['matrix'] == 0)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.audio].label} Target`,
          id: `target_${matrixnames.audio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.audio],
          isVisible: options => {
            return (options['matrix'] == 1)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.data].label} Target`,
          id: `target_${matrixnames.data}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.data],
          isVisible: options => {
            return (options['matrix'] == 2)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.multichannelaudio].label} Target`,
          id: `target_${matrixnames.multichannelaudio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.multichannelaudio],
          isVisible: options => {
            return (options['matrix'] == 3)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.gpio].label} Target`,
          id: `target_${matrixnames.gpio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.gpio],
          isVisible: options => {
            return (options['matrix'] == 4)
          }
        }
      ],
      callback: (feedback) => {
        let matrix = Number(feedback.options['matrix'])
        let target = Number(feedback.options[`target_${matrix}`])
        if (!Number.isNaN(matrix) && !Number.isNaN(target)) {
          return state.selected.target == target && state.selected.matrix == matrix
        } else return false
      }
    },
    [FeedbackId.TakeTallySource]: {
      name: 'Source routed on selected target',
      description: 'Returns true, when the picked source is the one currently routed to the selected target.',
      type: 'boolean',
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0)
      },
      options: [
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.video].label} Source`,
          id: `source_${matrixnames.video}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video],
          isVisible: (options) => {
            return (options['matrix'] == 0)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.audio].label} Source`,
          id: `source_${matrixnames.audio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio],
          isVisible: options => {
            return (options['matrix'] == 1)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.data].label} Source`,
          id: `source_${matrixnames.data}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data],
          isVisible: options => {
            return (options['matrix'] == 2)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.multichannelaudio].label} Source`,
          id: `source_${matrixnames.multichannelaudio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio],
          isVisible: options => {
            return (options['matrix'] == 3)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.gpio].label} Source`,
          id: `source_${matrixnames.gpio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio],
          isVisible: options => {
            return (options['matrix'] == 4)
          }
        }
      ],
      callback: (feedback) => {
        let matrix = Number(feedback.options['matrix'])
        let source = Number(feedback.options[`source_${matrix}`])
        if (Number.isNaN(matrix) && Number.isNaN(source) && (
          state.selected.matrix !== matrix ||
          state.matrices[state.selected.matrix].outputs == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target) == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route == undefined)
        )return false
        return source == state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route
      }
    },
    [FeedbackId.RoutingTally]: {
      name: 'Crosspoint Signal',
      description: 'Returns true, when a picked source is routed on a picked target. Shows if crosspoint is set.',
      type: 'boolean',
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0)
      },
      options: [
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.video].label} Source`,
          id: `source_${matrixnames.video}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video],
          isVisible: (options) => {
            return (options['matrix'] == 0)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.audio].label} Source`,
          id: `source_${matrixnames.audio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio],
          isVisible: options => {
            return (options['matrix'] == 1)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.data].label} Source`,
          id: `source_${matrixnames.data}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data],
          isVisible: options => {
            return (options['matrix'] == 2)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.multichannelaudio].label} Source`,
          id: `source_${matrixnames.multichannelaudio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio],
          isVisible: options => {
            return (options['matrix'] == 3)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.gpio].label} Source`,
          id: `source_${matrixnames.gpio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio],
          isVisible: options => {
            return (options['matrix'] == 4)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.video].label} Target`,
          id: `target_${matrixnames.video}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.video],
          isVisible: (options) => {
            return (options['matrix'] == 0)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.audio].label} Target`,
          id: `target_${matrixnames.audio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.audio],
          isVisible: options => {
            return (options['matrix'] == 1)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.data].label} Target`,
          id: `target_${matrixnames.data}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.data],
          isVisible: options => {
            return (options['matrix'] == 2)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.multichannelaudio].label} Target`,
          id: `target_${matrixnames.multichannelaudio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.multichannelaudio],
          isVisible: options => {
            return (options['matrix'] == 3)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.gpio].label} Target`,
          id: `target_${matrixnames.gpio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.gpio],
          isVisible: options => {
            return (options['matrix'] == 4)
          }
        }
      ],
      callback: (feedback) => {
        let matrix = Number(feedback.options['matrix'])
        let target = Number(feedback.options[`target_${matrix}`])
        let source = Number(feedback.options[`source_${matrix}`])
        if (Number.isNaN(matrix) ||
          Number.isNaN(target) ||
          Number.isNaN(source) ||
          state.matrices[matrix].outputs == undefined ||
          state.matrices[matrix].outputs.get(target) == undefined ||
          state.matrices[matrix].outputs.get(target)?.route == undefined) {
          return false
        } else {
          return source == state.matrices[matrix].outputs.get(target)?.route
        }
      }
    },
    [FeedbackId.SelectedMatrix]: {
      name: 'Selected Matrix',
      description: 'Returns true when the picked matrix is selected.',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(0, 0, 255),
        color: combineRgb(255, 255, 255)
      },
      options: [
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices,
        }
      ],
      callback: (feedback) => {
        return state.selected.matrix == Number(feedback.options['matrix'])
      }
    },
  }
  return feedbacks
}
