import {
  CompanionActionDefinition,
  CompanionActionDefinitions,
  CompanionActionEvent,
  InstanceBase,
} from '@companion-module/base'
import {EmberClient, Model as EmberModel} from 'emberplus-connection'
import {MediornetConfig} from './config'
import {FeedbackId} from './feedback'
import {matrixnames, MediornetState} from './state'
import {getInputChoices} from "./choices";

export enum ActionId {
  Take = 'take',
  SetSourceVideo = 'setSourceVideo',
  SetTargetVideo = 'setTargetVideo',
  SetSourceAudio = 'setSourceAudio',
  SetTargetAudio = 'setTargetAudio',
  SetSourceData = 'setSourceData',
  SetTargetData = 'setTargetData',
  SetSourceMChAudio = 'setSourceMChAudio',
  SetTargetMChAudio = 'setTargetMChAduio',
  SetSourceGPIO = 'setSourceGPIO',
  SetTargetGPIO = 'setTargetGPIO',
}

/**
 * Performes a connection on a specified matrix.
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param state reference to the state of the module
 * @param selMatrix number of the wanted matrix
 */
const doMatrixActionFunction = function (
  self: InstanceBase<MediornetConfig>,
  emberClient: EmberClient,
  state: MediornetState,
  selMatrix: number
) {
  if (
    state.selectedSource[selMatrix] !== -1 &&
    state.selectedDestination[selMatrix] !== -1
  ) {
    self.log('debug', 'Get node ' + state.matrices[selMatrix].label)
    emberClient
      .getElementByPath(state.matrices[selMatrix].path)
      .then((node) => {
        if (node && node.contents.type === EmberModel.ElementType.Matrix) {
          self.log('debug', 'Got node on ' + state.matrices[selMatrix].label)
          const target = state.selectedDestination[selMatrix]
          const sources = [state.selectedSource[selMatrix]]
          emberClient
            .matrixConnect(node as EmberModel.NumberedTreeNode<EmberModel.Matrix>, target, sources)
            .then((r) => self.log('debug', 'send ok: ' + String(r.sentOk)))
            .catch((r) => self.log('debug', r))
        } else {
          self.log('warn', 'Matrix ' + state.matrices[selMatrix].label + ' on ' + state.matrices[selMatrix].path + ' not found.')
        }
      })
      .catch((reason) => self.log('debug', reason))
  }
}

/**
 * Gets called, wenn take is not on Auto-Take.
 * Performes a connect on the wanted matrix
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param state reference to the state of the module
 */
const doTake =
  (self: InstanceBase<MediornetConfig>, emberClient: EmberClient, state: MediornetState) =>
    (action: CompanionActionEvent): void => {
      if (
        state.selectedDestination[Number(action.options['matrix'])] !== -1 &&
        state.selectedSource[Number(action.options['matrix'])] !== -1
      ) {
        doMatrixActionFunction(self, emberClient, state, Number(action.options['matrix']))
      } else {
        self.log('debug', 'TAKE went wrong.')
      }
      self.log(
        'debug',
        'TAKE: selectedDest: ' +
        state.selectedDestination[Number(action.options['matrix'])] +
        ' selectedSource: ' +
        state.selectedSource[Number(action.options['matrix'])] +
        ' on matrix ' +
        Number(action.options['matrix'])
      )

    }

/**
 * Selects a source on a specific matrix.
 * When Auto-Take is enabled the source is routed to the selected target.
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param config reference to the config of the module
 * @param state reference to the state of the module
 * @param matrix number of the wanted matrix
 */
const setSelectedSource =
  (self: InstanceBase<MediornetConfig>, emberClient: EmberClient, config: MediornetConfig, state: MediornetState, matrix:number) =>
    (action: CompanionActionEvent): void => {
      if (action.options['source'] != -1) {
        state.selectedSource[matrix] = Number(action.options['source'])
      }
      self.log('debug', 'Take is: ' + config.take)
      if (config.take) doMatrixActionFunction(self, emberClient, state, matrix)
      self.checkFeedbacks(FeedbackId.SourceBackgroundSelectedVideo, FeedbackId.SourceBackgroundSelectedAudio, FeedbackId.SourceBackgroundSelectedData, FeedbackId.SourceBackgroundSelectedMChAudio, FeedbackId.SourceBackgroundSelectedGPIO)
      self.log('debug', 'setSelectedSource: ' + action.options['source'] + ' on Matrix: ' + state.matrices[matrix].label)
    }

/**
 * Selects a target on a specified matrix.
 * @param self reference to the BaseInstance
 * @param state reference to the state of the module
 * @param matrix number of the wanted matrix
 */
const setSelectedTarget =
  (self: InstanceBase<MediornetConfig>, state: MediornetState, matrix: number) =>
    (action: CompanionActionEvent): void => {
      if (action.options['target'] != -1 && state.selectedDestination) {
        state.selectedDestination[matrix] = Number(action.options['target'])
        state.selectedMatrix = matrix
      }
      self.checkFeedbacks(FeedbackId.TargetBackgroundSelectedVideo, FeedbackId.TargetBackgroundSelectedAudio, FeedbackId.TargetBackgroundSelectedData, FeedbackId.TargetBackgroundSelectedMChAudio, FeedbackId.TargetBackgroundSelectedGPIO)
      self.checkFeedbacks(FeedbackId.SourceBackgroundRoutedVideo)
      self.log('debug', 'setSelectedTarget: ' + action.options['target'] + ' on Matrix: ' + state.matrices[matrix].label)
    }

/**
 * Returns all implemented actions.
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param config reference to the config of the module
 * @param state reference to the state of the module
 * @constructor
 */
export function GetActionsList(
  self: InstanceBase<MediornetConfig>,
  emberClient: EmberClient,
  config: MediornetConfig,
  state: MediornetState
): CompanionActionDefinitions {

  const { inputChoices, outputChoices } = getInputChoices(state)

  const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
    [ActionId.Take]: {
      name: 'Take',
      options: [
        {
          type: 'number',
          label: 'Matrix Number',
          id: 'matrix',
          required: true,
          min: 0,
          max: 0xffffffff,
          default: 0,
        },
      ],
      callback: doTake(self, emberClient, state),
    },
    [ActionId.SetSourceVideo]: {
      name: 'Select Video Source',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video]
        },
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.video),
    },
    [ActionId.SetTargetVideo]: {
      name: 'Select Video Target',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.video]
        },
      ],
      callback: setSelectedTarget(self, state, matrixnames.video),
    },
    [ActionId.SetSourceAudio]: {
      name: 'Select Audio Source',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio]
        },
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.audio),
    },
    [ActionId.SetTargetAudio]: {
      name: 'Select Audio Target',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.audio]
        },
      ],
      callback: setSelectedTarget(self, state, matrixnames.audio),
    },
    [ActionId.SetSourceData]: {
      name: 'Select Data Source',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data]
        },
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.data),
    },
    [ActionId.SetTargetData]: {
      name: 'Select Data Target',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.data]
        },
      ],
      callback: setSelectedTarget(self, state, matrixnames.data),
    },
    [ActionId.SetSourceMChAudio]: {
      name: 'Select MultiChannelAudio Source',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio]
        },
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.multichannelaudio),
    },
    [ActionId.SetTargetMChAudio]: {
      name: 'Select MultiChannelAudio Target',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.multichannelaudio]
        },
      ],
      callback: setSelectedTarget(self, state, matrixnames.multichannelaudio),
    },
    [ActionId.SetSourceGPIO]: {
      name: 'Select GPI Source',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio]
        },
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.gpio),
    },
    [ActionId.SetTargetGPIO]: {
      name: 'Select GPO Target',
      options: [
        {
          type: 'dropdown',
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.gpio]
        },
      ],
      callback: setSelectedTarget(self, state, matrixnames.gpio),
    },
  }

  return actions
}
