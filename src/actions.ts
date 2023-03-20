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
  Clear = 'clear',
  SetSourceVideo = 'select_source_video',
  SetTargetVideo = 'select_target_video',
  SetSourceAudio = 'select_source_audio',
  SetTargetAudio = 'select_target_audio',
  SetSourceData = 'select_source_data',
  SetTargetData = 'select_target_data',
  SetSourceMChAudio = 'select_source_multichannelaudio',
  SetTargetMChAudio = 'select_target_multichannelaudio',
  SetSourceGPIO = 'select_source_gpio',
  SetTargetGPIO = 'select_target_gpio',
}

/**
 * Performes a connection on a specified matrix.
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param state reference to the state of the module
 */
const doMatrixActionFunction = function (
  self: InstanceBase<MediornetConfig>,
  emberClient: EmberClient,
  state: MediornetState
) {
  if (
    state.selectedSource !== -1 &&
    state.selectedDestination !== -1 &&
    state.selectedMatrix !== -1
  ) {
    self.log('debug', 'Get node ' + state.matrices[state.selectedMatrix].label + ' matrix')
    emberClient
      .getElementByPath(state.matrices[state.selectedMatrix].path)
      .then((node) => {
        if (node && node.contents.type === EmberModel.ElementType.Matrix) {
          self.log('debug', 'Got node on ' + state.matrices[state.selectedMatrix].label)
          const target = state.selectedDestination
          const sources = [state.selectedSource]
          emberClient
            .matrixConnect(node as EmberModel.NumberedTreeNode<EmberModel.Matrix>, target, sources)
            .then((r) => self.log('debug', 'send ok: ' + String(r.sentOk)))
            .catch((r) => self.log('debug', r))
        } else {
          self.log('warn', 'Matrix ' + state.matrices[state.selectedMatrix].label + ' on ' + state.matrices[state.selectedMatrix].path + ' not found.')
        }
      })
      .catch((reason) => self.log('error', reason))
      .finally(() => {
        state.selectedMatrix = state.selectedSource = state.selectedDestination = -1
        self.checkFeedbacks(FeedbackId.SelectedTargetVideo, FeedbackId.SelectedTargetAudio, FeedbackId.SelectedTargetData, FeedbackId.SelectedTargetMultiChannelAudio, FeedbackId.SelectedTargetGPIO, FeedbackId.TakeTallySourceVideo, FeedbackId.TakeTallySourceAudio, FeedbackId.TakeTallySourceData, FeedbackId.TakeTallySourceMultiChannelAudio, FeedbackId.TakeTallySourceGPIO, FeedbackId.SelectedSourceVideo, FeedbackId.SelectedSourceAudio, FeedbackId.SelectedSourceData, FeedbackId.SelectedSourceMultiChannelAudio, FeedbackId.SelectedSourceGPIO, FeedbackId.Take, FeedbackId.Clear)

      })
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
        state.selectedDestination !== -1 &&
        state.selectedSource !== -1 &&
        state.selectedMatrix !== -1
      ) {
        self.log(
          'debug',
          'TAKE: selectedDest: ' +
          state.selectedDestination +
          ' selectedSource: ' +
          state.selectedSource +
          ' on matrix ' +
          Number(action.options['matrix']))
        doMatrixActionFunction(self, emberClient, state)
      } else {
        self.log('debug', 'TAKE went wrong.')
      }
    }

/**
 * Clear the current selected Source and Target
 * @param self reference to the BaseInstance
 * @param state reference to the modules state
 */
const doClear = (self: InstanceBase<MediornetConfig>, state: MediornetState) => (): void => {
  state.selectedMatrix = state.selectedSource = state.selectedDestination = -1
  self.checkFeedbacks(FeedbackId.SelectedTargetVideo, FeedbackId.SelectedTargetAudio, FeedbackId.SelectedTargetData, FeedbackId.SelectedTargetMultiChannelAudio, FeedbackId.SelectedTargetGPIO, FeedbackId.TakeTallySourceVideo, FeedbackId.TakeTallySourceAudio, FeedbackId.TakeTallySourceData, FeedbackId.TakeTallySourceMultiChannelAudio, FeedbackId.TakeTallySourceGPIO, FeedbackId.SelectedSourceVideo, FeedbackId.SelectedSourceAudio, FeedbackId.SelectedSourceData, FeedbackId.SelectedSourceMultiChannelAudio, FeedbackId.SelectedSourceGPIO, FeedbackId.Take, FeedbackId.Clear)
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
  (self: InstanceBase<MediornetConfig>, emberClient: EmberClient, config: MediornetConfig, state: MediornetState, matrix: number) =>
    (action: CompanionActionEvent): void => {
      if (action.options['source'] != -1
        && matrix == state.selectedMatrix) {
        state.selectedSource = Number(action.options['source'])
        self.log('debug', 'Take is: ' + config.take)
        if (config.take) doMatrixActionFunction(self, emberClient, state)
        self.checkFeedbacks(FeedbackId.SelectedSourceVideo, FeedbackId.SelectedSourceAudio, FeedbackId.SelectedSourceData, FeedbackId.SelectedSourceMultiChannelAudio, FeedbackId.SelectedSourceGPIO, FeedbackId.Take, FeedbackId.Clear)
        self.log('debug', 'setSelectedSource: ' + action.options['source'] + ' on Matrix: ' + state.matrices[matrix].label)
      }
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
      if (action.options['target'] != -1) {
        state.selectedDestination = Number(action.options['target'])
        state.selectedMatrix = matrix
      }
      state.selectedSource = -1
      self.checkFeedbacks(FeedbackId.SelectedTargetVideo, FeedbackId.SelectedTargetAudio, FeedbackId.SelectedTargetData, FeedbackId.SelectedTargetMultiChannelAudio, FeedbackId.SelectedTargetGPIO, FeedbackId.TakeTallySourceVideo, FeedbackId.TakeTallySourceAudio, FeedbackId.TakeTallySourceData, FeedbackId.TakeTallySourceMultiChannelAudio, FeedbackId.TakeTallySourceGPIO, FeedbackId.SelectedSourceVideo, FeedbackId.SelectedSourceAudio, FeedbackId.SelectedSourceData, FeedbackId.SelectedSourceMultiChannelAudio, FeedbackId.SelectedSourceGPIO, FeedbackId.Take, FeedbackId.Clear)
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

  const {inputChoices, outputChoices} = getInputChoices(state)

  const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
    [ActionId.Take]: {
      name: 'Take',
      options: [],
      callback: doTake(self, emberClient, state),
    },
    [ActionId.Clear]: {
      name: 'Clear',
      options: [],
      callback: doClear(self, state),
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
