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
  SourceBackgroundSelectedVideo = 'sourceBackgroundSelectedVideo',
  SourceBackgroundSelectedAudio = 'sourceBackgroundSelectedAudio',
  SourceBackgroundSelectedData = 'sourceBackgroundSelectedData',
  SourceBackgroundSelectedMChAudio = 'sourceBackgroundSelectedMChAudio',
  SourceBackgroundSelectedGPIO = 'sourceBackgroundSelectedGPIO',
  TargetBackgroundSelectedVideo = 'targetBackgroundSelectedVideo',
  TargetBackgroundSelectedAudio = 'targetBackgroundSelectedAudio',
  TargetBackgroundSelectedData = 'targetBackgroundSelectedData',
  TargetBackgroundSelectedMChAudio = 'targetBackgroundSelectedMChAudio',
  TargetBackgroundSelectedGPIO = 'targetBackgroundSelectedGPIO',
  SourceBackgroundRoutedVideo = 'sourceBackgroundRoutedVideo',
  SourceBackgroundRoutedAudio = 'sourceBackgroundRoutedAudio',
  SourceBackgroundRoutedData = 'sourceBackgroundRoutedData',
  SourceBackgroundRoutedMChAudio = 'sourceBackgroundRoutedMChAudio',
  SourceBackgroundRoutedGPIO = 'sourceBackgroundRoutedGPIO',
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
    [FeedbackId.SourceBackgroundSelectedVideo]: {
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
        return state.selectedSource[matrixnames.video] == feedback.options['source'];
      }
    },[FeedbackId.SourceBackgroundSelectedAudio]: {
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
        return state.selectedSource[matrixnames.audio] == feedback.options['source'];
      }
    },[FeedbackId.SourceBackgroundSelectedData]: {
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
        return state.selectedSource[matrixnames.data] == feedback.options['source'];
      }
    },[FeedbackId.SourceBackgroundSelectedMChAudio]: {
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
        return state.selectedSource[matrixnames.multichannelaudio] == feedback.options['source'];
      }
    },[FeedbackId.SourceBackgroundSelectedGPIO]: {
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
        return state.selectedSource[matrixnames.gpio] == feedback.options['source'];
      }
    },
    [FeedbackId.TargetBackgroundSelectedVideo]: {
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
        return (state.selectedDestination[matrixnames.video] == feedback.options['target'])
      }
    },
    [FeedbackId.TargetBackgroundSelectedAudio]: {
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
        return (state.selectedDestination[matrixnames.audio] == feedback.options['target'])
      }
    },
    [FeedbackId.TargetBackgroundSelectedData]: {
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
        return (state.selectedDestination[matrixnames.data] == feedback.options['target'])
      }
    },
    [FeedbackId.TargetBackgroundSelectedMChAudio]: {
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
        return (state.selectedDestination[matrixnames.multichannelaudio] == feedback.options['target'])
      }
    },
    [FeedbackId.TargetBackgroundSelectedGPIO]: {
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
        return (state.selectedDestination[matrixnames.gpio] == feedback.options['target'])
      }
    },
    [FeedbackId.SourceBackgroundRoutedVideo]: {
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
          state.outputs[matrixnames.video][state.selectedDestination[matrixnames.video]] == undefined ||
          state.outputs[matrixnames.video][state.selectedDestination[matrixnames.video]].route == undefined) return false
        return (feedback.options['source'] == state.outputs[matrixnames.video][state.selectedDestination[matrixnames.video]].route)
      }
    },
    [FeedbackId.SourceBackgroundRoutedAudio]: {
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
          state.outputs[matrixnames.audio][state.selectedDestination[matrixnames.audio]] == undefined ||
          state.outputs[matrixnames.audio][state.selectedDestination[matrixnames.audio]].route == undefined) return false
        return (feedback.options['source'] == state.outputs[matrixnames.audio][state.selectedDestination[matrixnames.audio]].route)
      }
    },
    [FeedbackId.SourceBackgroundRoutedData]: {
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
          state.outputs[matrixnames.data][state.selectedDestination[matrixnames.data]] == undefined ||
          state.outputs[matrixnames.data][state.selectedDestination[matrixnames.data]].route == undefined) return false
        return (feedback.options['source'] == state.outputs[matrixnames.data][state.selectedDestination[matrixnames.data]].route)
      }
    },
    [FeedbackId.SourceBackgroundRoutedMChAudio]: {
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
          state.outputs[matrixnames.multichannelaudio][state.selectedDestination[matrixnames.multichannelaudio]] == undefined ||
          state.outputs[matrixnames.multichannelaudio][state.selectedDestination[matrixnames.multichannelaudio]].route == undefined) return false
        return (feedback.options['source'] == state.outputs[matrixnames.multichannelaudio][state.selectedDestination[matrixnames.multichannelaudio]].route)
      }
    },
    [FeedbackId.SourceBackgroundRoutedGPIO]: {
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
          state.outputs[matrixnames.gpio][state.selectedDestination[matrixnames.gpio]] == undefined ||
          state.outputs[matrixnames.gpio][state.selectedDestination[matrixnames.gpio]].route == undefined) return false
        return (feedback.options['source'] == state.outputs[matrixnames.gpio][state.selectedDestination[matrixnames.gpio]].route)
      }
    },
  }

  return feedbacks
}
