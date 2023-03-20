import {
  CompanionFeedbackDefinition,
  CompanionFeedbackDefinitions,
  combineRgb, InstanceBase
} from '@companion-module/base'
import {EmberClient} from 'emberplus-connection'
import {MediornetConfig} from "./config";
import {matrixnames, MediornetState} from "./state";
import {getInputChoices} from "./choices";

export enum FeedbackId {
  Take = 'take',
  Clear = 'clear',
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
}

/**
 * Returns all implemented Feedbacks.
 * @param _self reference to the BaseInstance
 * @param _emberClient reference to the emberClient
 * @param state reference to the state of the module
 * @constructor
 */
export function GetFeedbacksList(
  _self: InstanceBase<MediornetConfig>,
  _emberClient: EmberClient,
  state: MediornetState
): CompanionFeedbackDefinitions {
  const {inputChoices, outputChoices} = getInputChoices(state)
  const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
    [FeedbackId.Take]: {
      name: 'Take is possible',
      description: 'Shows if there is take possible',
      type: "boolean",
      defaultStyle: {
        bgcolor: combineRgb(255, 255, 255),
        color: combineRgb(255, 0, 0),
      },
      options: [],
      callback: () =>{
        return state.selectedDestination != -1 && state.selectedSource != -1 && state.selectedMatrix != -1 && state.selectedSource != state.outputs[state.selectedMatrix][state.selectedDestination].route
      }
    },
    [FeedbackId.Clear]: {
      name: 'Clear is possible',
      description: 'Changes when a selection is made.',
      type: "boolean",
      defaultStyle: {
        bgcolor: combineRgb(255, 255, 255),
        color: combineRgb(255, 0, 0),
      },
      options: [],
      callback: () =>{
        return state.selectedDestination != -1 || state.selectedSource != -1 || state.selectedMatrix != -1
      }
    },

    [FeedbackId.SelectedSourceVideo]: {
      name: 'Video Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return state.selectedSource == feedback.options['source'] && state.selectedMatrix == matrixnames.video;
      }
    },[FeedbackId.SelectedSourceAudio]: {
      name: 'Audio Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return state.selectedSource == feedback.options['source'] && state.selectedMatrix == matrixnames.audio;
      }
    },[FeedbackId.SelectedSourceData]: {
      name: 'Data Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return state.selectedSource == feedback.options['source'] && state.selectedMatrix == matrixnames.data;
      }
    },[FeedbackId.SelectedSourceMultiChannelAudio]: {
      name: 'MChAudio Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return state.selectedSource == feedback.options['source'] && state.selectedMatrix == matrixnames.multichannelaudio;
      }
    },[FeedbackId.SelectedSourceGPIO]: {
      name: 'GPI Source Background If Selected',
      description: 'Change Background of Source, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return state.selectedSource == feedback.options['source'] && state.selectedMatrix == matrixnames.gpio;
      }
    },
    [FeedbackId.SelectedTargetVideo]: {
      name: 'Video Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return (state.selectedDestination == feedback.options['target'] && state.selectedMatrix == matrixnames.video)
      }
    },
    [FeedbackId.SelectedTargetAudio]: {
      name: 'Audio Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return (state.selectedDestination == feedback.options['target'] && state.selectedMatrix == matrixnames.audio)
      }
    },
    [FeedbackId.SelectedTargetData]: {
      name: 'Data Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return (state.selectedDestination == feedback.options['target'] && state.selectedMatrix == matrixnames.data)
      }
    },
    [FeedbackId.SelectedTargetMultiChannelAudio]: {
      name: 'MChAudio Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return (state.selectedDestination == feedback.options['target'] && state.selectedMatrix == matrixnames.multichannelaudio)
      }
    },
    [FeedbackId.SelectedTargetGPIO]: {
      name: 'GPO Target Background if Selected',
      description: 'Change Background of Target, when it is currently selected.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        return (state.selectedDestination == feedback.options['target'] && state.selectedMatrix == matrixnames.gpio)
      }
    },
    [FeedbackId.TakeTallySourceVideo]: {
      name: 'Video Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        if (state.outputs == undefined ||
          state.outputs[matrixnames.video][state.selectedDestination] == undefined ||
          state.outputs[matrixnames.video][state.selectedDestination].route == undefined ||
          state.selectedMatrix !== matrixnames.video) return false
        return (feedback.options['source'] == state.outputs[matrixnames.video][state.selectedDestination].route)
      }
    },
    [FeedbackId.TakeTallySourceAudio]: {
      name: 'Audio Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        if (state.outputs == undefined ||
          state.outputs[matrixnames.audio][state.selectedDestination] == undefined ||
          state.outputs[matrixnames.audio][state.selectedDestination].route == undefined ||
          state.selectedMatrix !== matrixnames.multichannelaudio) return false
        return (feedback.options['source'] == state.outputs[matrixnames.audio][state.selectedDestination].route)
      }
    },
    [FeedbackId.TakeTallySourceData]: {
      name: 'Data Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        if (state.outputs == undefined ||
          state.outputs[matrixnames.data][state.selectedDestination] == undefined ||
          state.outputs[matrixnames.data][state.selectedDestination].route == undefined ||
          state.selectedMatrix !== matrixnames.data) return false
        return (feedback.options['source'] == state.outputs[matrixnames.data][state.selectedDestination].route)
      }
    },
    [FeedbackId.TakeTallySourceMultiChannelAudio]: {
      name: 'MChAudio Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        if (state.outputs == undefined ||
          state.outputs[matrixnames.multichannelaudio][state.selectedDestination] == undefined ||
          state.outputs[matrixnames.multichannelaudio][state.selectedDestination].route == undefined ||
          state.selectedMatrix !== matrixnames.multichannelaudio) return false
        return (feedback.options['source'] == state.outputs[matrixnames.multichannelaudio][state.selectedDestination].route)
      }
    },
    [FeedbackId.TakeTallySourceGPIO]: {
      name: 'GPI Source Background if routed on selected Target',
      description: 'Change Background of Source, when it is currently routed on the selected target.',
      type: "boolean",
      defaultStyle: {
        // The default style change for a boolean feedback
        // The user will be able to customise these values as well as the fields that will be changed
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(0, 0, 0),
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
        if (state.outputs == undefined ||
          state.outputs[matrixnames.gpio][state.selectedDestination] == undefined ||
          state.outputs[matrixnames.gpio][state.selectedDestination].route == undefined ||
          state.selectedMatrix !== matrixnames.gpio) return false
        return (feedback.options['source'] == state.outputs[matrixnames.gpio][state.selectedDestination].route)
      }
    },
  }

  return feedbacks
}
