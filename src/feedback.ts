import {
  CompanionFeedbackDefinition,
  CompanionFeedbackDefinitions,
  combineRgb,
  InstanceBase
} from '@companion-module/base'
import { DeviceConfig } from './config'
import { matrixnames, DeviceState } from './state'
import { getInputChoices } from './choices'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'

export enum FeedbackId {
  Take = 'take',
  Clear = 'clear',
  Undo = 'undo',
  SelectedSourceVideo = 'selected_source_video',
  SelectedSourceAudio = 'selected_source_audio',
  SelectedSourceData = 'selected_source_data',
  SelectedSourceMultiChannelAudio = 'selected_source_multichannelaudio',
  SelectedSourceGPIO = 'selected_source_gpio',
  SelectedTargetVideo = 'selected_target_video',
  SelectedTargetAudio = 'selected_target_audio',
  SelectedTargetData = 'selected_target_data',
  SelectedTargetMultiChannelAudio = 'selected_target_multichannelaudio',
  SelectedTargetGPIO = 'selected_target_gpio',
  TakeTallySourceVideo = 'take_tally_source_video',
  TakeTallySourceAudio = 'take_tally_source_audio',
  TakeTallySourceData = 'take_tally_source_data',
  TakeTallySourceMultiChannelAudio = 'take_tally_source_multichannelaudio',
  TakeTallySourceGPIO = 'take_tally_source_gpio',
  RoutingTallyVideo = 'routing_tally_video',
  RoutingTallyAudio = 'routing_tally_audio',
  RoutingTallyData = 'routing_tally_data',
  RoutingTallyMultiChannelAudio = 'routing_tally_multichannelaudio',
  RoutingTallyGPIO = 'routing_tally_gpio',
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
  const { inputChoices, outputChoices } = getInputChoices(state)
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
      description: 'Changes when a selection is made.',
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
      name: 'True if undo possible',
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
    [FeedbackId.SelectedSourceVideo]: {
      name: 'Video Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video]
        }
      ],
      callback: (feedback) => {
        return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.video
      }
    },
    [FeedbackId.SelectedSourceAudio]: {
      name: 'Audio Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio]
        }
      ],
      callback: (feedback) => {
        return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.audio
      }
    },
    [FeedbackId.SelectedSourceData]: {
      name: 'Data Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data]
        }
      ],
      callback: (feedback) => {
        return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.data
      }
    },
    [FeedbackId.SelectedSourceMultiChannelAudio]: {
      name: 'MChAudio Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio]
        }
      ],
      callback: (feedback) => {
        return (
          state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.multichannelaudio
        )
      }
    },
    [FeedbackId.SelectedSourceGPIO]: {
      name: 'GPI Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio]
        }
      ],
      callback: (feedback) => {
        return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.gpio
      }
    },
    [FeedbackId.SelectedTargetVideo]: {
      name: 'Video Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
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
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.video]
        }
      ],
      callback: (feedback) => {
        return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.video
      }
    },
    [FeedbackId.SelectedTargetAudio]: {
      name: 'Audio Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
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
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.audio]
        }
      ],
      callback: (feedback) => {
        return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.audio
      }
    },
    [FeedbackId.SelectedTargetData]: {
      name: 'Data Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
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
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.data]
        }
      ],
      callback: (feedback) => {
        return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.data
      }
    },
    [FeedbackId.SelectedTargetMultiChannelAudio]: {
      name: 'MChAudio Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
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
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.multichannelaudio]
        }
      ],
      callback: (feedback) => {
        return (
          state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.multichannelaudio
        )
      }
    },
    [FeedbackId.SelectedTargetGPIO]: {
      name: 'GPO Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
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
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.gpio]
        }
      ],
      callback: (feedback) => {
        return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.gpio
      }
    },
    [FeedbackId.TakeTallySourceVideo]: {
      name: 'Video Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video]
        }
      ],
      callback: (feedback) => {
        if (
          state.selected.matrix !== matrixnames.video ||
          state.matrices[state.selected.matrix].outputs == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target) == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route == undefined
        )
          return false
        return feedback.options['source'] == state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route
      }
    },
    [FeedbackId.TakeTallySourceAudio]: {
      name: 'Audio Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio]
        }
      ],
      callback: (feedback) => {
        if (
          state.selected.matrix !== matrixnames.audio ||
          state.matrices[state.selected.matrix].outputs == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target) == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route == undefined
        )
          return false
        return feedback.options['source'] == state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route
      }
    },
    [FeedbackId.TakeTallySourceData]: {
      name: 'Data Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data]
        }
      ],
      callback: (feedback) => {
        if (
          state.selected.matrix !== matrixnames.data ||
          state.matrices[state.selected.matrix].outputs == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target) == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route == undefined
        )
          return false
        return feedback.options['source'] == state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route
      }
    },
    [FeedbackId.TakeTallySourceMultiChannelAudio]: {
      name: 'MChAudio Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio]
        }
      ],
      callback: (feedback) => {
        if (
          state.selected.matrix !== matrixnames.multichannelaudio ||
          state.matrices[state.selected.matrix].outputs == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target) == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route == undefined
        )
          return false
        return feedback.options['source'] == state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route
      }
    },
    [FeedbackId.TakeTallySourceGPIO]: {
      name: 'GPI Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
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
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio]
        }
      ],
      callback: (feedback) => {
        if (
          state.selected.matrix !== matrixnames.gpio ||
          state.matrices[state.selected.matrix].outputs == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target) == undefined ||
          state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route == undefined
        )
          return false
        return feedback.options['source'] == state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route
      }
    },
    [FeedbackId.RoutingTallyVideo]: {
      name: 'Video Source is routed to specific target.',
      description: 'Change Background of Button, when it is currently routed to a specified target.',
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
          label: 'Source',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video]
        },
        {
          type: 'dropdown',
          label: 'Target',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.video]
        }
      ],
      callback: (feedback) => {
          let target_id = Number(feedback.options['target'])
          if (state.matrices[matrixnames.video].outputs == undefined ||
            state.matrices[matrixnames.video].outputs.get(target_id) == undefined ||
            state.matrices[matrixnames.video].outputs.get(target_id)?.route == undefined) {
            return false
          } else {
            return feedback.options['source'] == state.matrices[matrixnames.video].outputs.get(target_id)?.route
          }
      }
    },

    [FeedbackId.RoutingTallyAudio]: {
      name: 'Audio Source is routed to specific target.',
      description: 'Change Background of Button, when it is currently routed to a specified target.',
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
          label: 'Source',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio]
        },
        {
          type: 'dropdown',
          label: 'Target',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.audio]
        }
      ],
      callback: (feedback) => {
        let target_id = Number(feedback.options['target'])
        if (state.matrices[matrixnames.audio].outputs == undefined ||
          state.matrices[matrixnames.audio].outputs.get(target_id) == undefined ||
          state.matrices[matrixnames.audio].outputs.get(target_id)?.route == undefined) {
          return false
        } else {
          return feedback.options['source'] == state.matrices[matrixnames.audio].outputs.get(target_id)?.route
        }
      }
    },
    [FeedbackId.RoutingTallyData]: {
      name: 'Data Source is routed to specific target.',
      description: 'Change Background of Button, when it is currently routed to a specified target.',
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
          label: 'Source',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data]
        },
        {
          type: 'dropdown',
          label: 'Target',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.data]
        }
      ],
      callback: (feedback) => {
        let target_id = Number(feedback.options['target'])
        if (state.matrices[matrixnames.data].outputs == undefined ||
          state.matrices[matrixnames.data].outputs.get(target_id) == undefined ||
          state.matrices[matrixnames.data].outputs.get(target_id)?.route == undefined) {
          return false
        } else {
          return feedback.options['source'] == state.matrices[matrixnames.data].outputs.get(target_id)?.route
        }
      }
    },

    [FeedbackId.RoutingTallyMultiChannelAudio]: {
      name: 'MultiChannelAudio Source is routed to specific target.',
      description: 'Change Background of Button, when it is currently routed to a specified target.',
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
          label: 'Source',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio]
        },
        {
          type: 'dropdown',
          label: 'Target',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.multichannelaudio]
        }
      ],
      callback: (feedback) => {
        let target_id = Number(feedback.options['target'])
        if (state.matrices[matrixnames.multichannelaudio].outputs == undefined ||
          state.matrices[matrixnames.multichannelaudio].outputs.get(target_id) == undefined ||
          state.matrices[matrixnames.multichannelaudio].outputs.get(target_id)?.route == undefined) {
          return false
        } else {
          return feedback.options['source'] == state.matrices[matrixnames.multichannelaudio].outputs.get(target_id)?.route
        }
      }
    },

    [FeedbackId.RoutingTallyGPIO]: {
      name: 'GPI Source is routed to specific target.',
      description: 'Change Background of Button, when it is currently routed to a specified target.',
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
          label: 'Source',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio]
        },
        {
          type: 'dropdown',
          label: 'Target',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.gpio]
        }
      ],
      callback: (feedback) => {
        let target_id = Number(feedback.options['target'])
        if (state.matrices[matrixnames.gpio].outputs == undefined ||
          state.matrices[matrixnames.gpio].outputs.get(target_id) == undefined ||
          state.matrices[matrixnames.gpio].outputs.get(target_id)?.route == undefined) {
          return false
        } else {
          return feedback.options['source'] == state.matrices[matrixnames.gpio].outputs.get(target_id)?.route
        }
      }
    },
  }
  return feedbacks
}
