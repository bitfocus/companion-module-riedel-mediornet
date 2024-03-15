import {
  CompanionActionDefinition,
  CompanionActionDefinitions,
  CompanionActionEvent,
  InstanceBase
} from '@companion-module/base'
import { DeviceConfig } from './config'
import { FeedbackId } from './feedback'
import { matrixnames, DeviceState } from './state'
import { getInputChoices } from './choices'
import { updateSelectedTargetVariables } from './variables'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'
import { QualifiedMatrix } from 'node-emberplus/lib/common/matrix/qualified-matrix'

export enum ActionId {
  Take = 'take',
  Clear = 'clear',
  Undo = 'undo',
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
 * @param config reference to the config of the module
 * @param state reference to the state of the module
 */
const doMatrixActionFunction = function(
  self: InstanceBase<DeviceConfig>,
  emberClient: EmberClient,
  config: DeviceConfig,
  state: DeviceState
) {
  if (state.selected.source !== -1 && state.selected.target !== -1 && state.selected.matrix !== -1) {
    if (state.selected.source !== -1 && state.selected.target !== -1 && state.selected.matrix !== -1) {
      self.log('debug', 'Get node ' + state.matrices[state.selected.matrix].label + ' matrix')
      emberClient
        .getElementByPathAsync(state.matrices[state.selected.matrix].path)
        .then((node) => {
          if (node && node instanceof QualifiedMatrix) {
            self.log('debug', 'Got node on ' + state.matrices[state.selected.matrix].label)
            const target = state.selected.target
            const sources = [state.selected.source]
            emberClient
              .matrixConnectAsync(node, target, sources)
              .then(() => self.log('debug', 'send ok: '))
              .catch((r) => self.log('debug', r))
          } else {
            self.log(
              'warn',
              'Matrix ' +
              state.matrices[state.selected.matrix].label +
              ' on ' +
              state.matrices[state.selected.matrix].path +
              ' not found.'
            )
          }
        })
        .catch((reason) => self.log('error', reason))
        .finally(() => {

          if (config.take_reset) state.selected.matrix = state.selected.source = state.selected.target = -1

          self.checkFeedbacks(
            FeedbackId.SelectedTargetVideo,
            FeedbackId.SelectedTargetAudio,
            FeedbackId.SelectedTargetData,
            FeedbackId.SelectedTargetMultiChannelAudio,
            FeedbackId.SelectedTargetGPIO,
            FeedbackId.TakeTallySourceVideo,
            FeedbackId.TakeTallySourceAudio,
            FeedbackId.TakeTallySourceData,
            FeedbackId.TakeTallySourceMultiChannelAudio,
            FeedbackId.TakeTallySourceGPIO,
            FeedbackId.SelectedSourceVideo,
            FeedbackId.SelectedSourceAudio,
            FeedbackId.SelectedSourceData,
            FeedbackId.SelectedSourceMultiChannelAudio,
            FeedbackId.SelectedSourceGPIO,
            FeedbackId.RoutingTallyVideo,
            FeedbackId.RoutingTallyAudio,
            FeedbackId.RoutingTallyData,
            FeedbackId.RoutingTallyMultiChannelAudio,
            FeedbackId.RoutingTallyGPIO,
            FeedbackId.Take,
            FeedbackId.Clear,
            FeedbackId.Undo
          )
          updateSelectedTargetVariables(self, state)
        })
    }
  }
}

/**
 * Gets called, wenn take is not on Auto-Take.
 * Performes a connect on the wanted matrix
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param config reference to the config of the module
 * @param state reference to the state of the module
 */
const doTake =
  (self: InstanceBase<DeviceConfig>, emberClient: EmberClient,
   config: DeviceConfig, state: DeviceState) =>
    (action: CompanionActionEvent): void => {
      if (state.selected.target !== -1 && state.selected.source !== -1 && state.selected.matrix !== -1) {
        self.log(
          'debug',
          'TAKE: selectedDest: ' +
          state.selected.target +
          ' selected.source: ' +
          state.selected.source +
          ' on matrix ' +
          Number(action.options['matrix'])
        )
        doMatrixActionFunction(self, emberClient, config, state)
      } else {
        self.log('debug', 'TAKE went wrong.')
      }
    }

/**
 * Clear the current selected Source and Target
 * @param self reference to the BaseInstance
 * @param state reference to the modules state
 */
const doClear = (self: InstanceBase<DeviceConfig>, state: DeviceState) => (): void => {
  state.selected.matrix = state.selected.source = state.selected.target = -1
  self.checkFeedbacks(
    FeedbackId.SelectedTargetVideo,
    FeedbackId.SelectedTargetAudio,
    FeedbackId.SelectedTargetData,
    FeedbackId.SelectedTargetMultiChannelAudio,
    FeedbackId.SelectedTargetGPIO,
    FeedbackId.TakeTallySourceVideo,
    FeedbackId.TakeTallySourceAudio,
    FeedbackId.TakeTallySourceData,
    FeedbackId.TakeTallySourceMultiChannelAudio,
    FeedbackId.TakeTallySourceGPIO,
    FeedbackId.SelectedSourceVideo,
    FeedbackId.SelectedSourceAudio,
    FeedbackId.SelectedSourceData,
    FeedbackId.SelectedSourceMultiChannelAudio,
    FeedbackId.SelectedSourceGPIO,
    FeedbackId.RoutingTallyVideo,
    FeedbackId.RoutingTallyAudio,
    FeedbackId.RoutingTallyData,
    FeedbackId.RoutingTallyMultiChannelAudio,
    FeedbackId.RoutingTallyGPIO,
    FeedbackId.Take,
    FeedbackId.Clear,
    FeedbackId.Undo
  )
  updateSelectedTargetVariables(self, state)
}

const doUndo = (self: InstanceBase<DeviceConfig>, emberClient: EmberClient,
                config: DeviceConfig, state: DeviceState) => (): void => {
  const selOut = state.matrices[state.selected.matrix].outputs.get(state.selected.target)
  if (selOut != undefined && selOut.fallback[selOut.fallback.length - 2] != undefined) {
    selOut.fallback.pop()
    state.selected.source = selOut.fallback.pop() ?? -1
    doMatrixActionFunction(self, emberClient, config, state)
    self.checkFeedbacks(
      FeedbackId.SelectedTargetVideo,
      FeedbackId.SelectedTargetAudio,
      FeedbackId.SelectedTargetData,
      FeedbackId.SelectedTargetMultiChannelAudio,
      FeedbackId.SelectedTargetGPIO,
      FeedbackId.TakeTallySourceVideo,
      FeedbackId.TakeTallySourceAudio,
      FeedbackId.TakeTallySourceData,
      FeedbackId.TakeTallySourceMultiChannelAudio,
      FeedbackId.TakeTallySourceGPIO,
      FeedbackId.SelectedSourceVideo,
      FeedbackId.SelectedSourceAudio,
      FeedbackId.SelectedSourceData,
      FeedbackId.SelectedSourceMultiChannelAudio,
      FeedbackId.SelectedSourceGPIO,
      FeedbackId.RoutingTallyVideo,
      FeedbackId.RoutingTallyAudio,
      FeedbackId.RoutingTallyData,
      FeedbackId.RoutingTallyMultiChannelAudio,
      FeedbackId.RoutingTallyGPIO,
      FeedbackId.Take,
      FeedbackId.Clear,
      FeedbackId.Undo
    )
  }
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
  (
    self: InstanceBase<DeviceConfig>,
    emberClient: EmberClient,
    config: DeviceConfig,
    state: DeviceState,
    matrix: number
  ) =>
    (action: CompanionActionEvent): void => {
      let check_continue = false
      if (action.options['source'] === 'next' || action.options['source'] === 'previous') {

        let tempList = state.matrices[state.selected.matrix].inputList
        let index = tempList.findIndex((value) => value == state.selected.source)

        if (state.selected.source == -1) state.selected.source = tempList[0]
        else if (index < tempList.length - 1 && action.options['source'] === 'next') state.selected.source = tempList[index + 1]
        else if (0 < index && action.options['source'] === 'previous') state.selected.source = tempList[index - 1]

        check_continue = true
      } else if (action.options['source'] != -1 && matrix == state.selected.matrix) {
        state.selected.source = Number(action.options['source'])
        self.log('debug', 'Take is: ' + config.take)
        if (config.take || action.options['do_take']) doMatrixActionFunction(self, emberClient, config, state)
        check_continue = true
      }
      if (check_continue) {
        self.checkFeedbacks(
          FeedbackId.SelectedSourceVideo,
          FeedbackId.SelectedSourceAudio,
          FeedbackId.SelectedSourceData,
          FeedbackId.SelectedSourceMultiChannelAudio,
          FeedbackId.SelectedSourceGPIO,
          FeedbackId.RoutingTallyVideo,
          FeedbackId.RoutingTallyAudio,
          FeedbackId.RoutingTallyData,
          FeedbackId.RoutingTallyMultiChannelAudio,
          FeedbackId.RoutingTallyGPIO,
          FeedbackId.Take,
          FeedbackId.Clear
        )
        updateSelectedTargetVariables(self, state)
        self.log(
          'debug',
          'setSelectedSource: ' + action.options['source'] + ' on Matrix: ' + state.matrices[matrix].label
        )
      }
    }

/**
 * Selects a target on a specified matrix.
 * @param self reference to the BaseInstance
 * @param state reference to the state of the module
 * @param matrix number of the wanted matrix
 */
const setSelectedTarget =
  (self: InstanceBase<DeviceConfig>, state: DeviceState, matrix: number) =>
    (action: CompanionActionEvent): void => {
      if (action.options['target'] === 'next' || action.options['target'] === 'previous') {
        let tempList = state.matrices[state.selected.matrix].outputList
        let index = tempList.findIndex((value) => value == state.selected.target)

        if (state.selected.target == -1) state.selected.target = tempList[0]
        else if (index < tempList.length - 1 && action.options['target'] === 'next') state.selected.target = tempList[index + 1]
        else if (0 < index && action.options['target'] === 'previous') state.selected.target = tempList[index - 1]


        state.selected.source = Number(state.matrices[matrix].outputs.get(Number(action.options['target']))?.route)

      } else if (action.options['target'] != -1) {
        state.selected.target = Number(action.options['target'])
        state.selected.matrix = matrix
        state.selected.source = Number(state.matrices[matrix].outputs.get(Number(action.options['target']))?.route)
      }
      self.checkFeedbacks(
        FeedbackId.SelectedTargetVideo,
        FeedbackId.SelectedTargetAudio,
        FeedbackId.SelectedTargetData,
        FeedbackId.SelectedTargetMultiChannelAudio,
        FeedbackId.SelectedTargetGPIO,
        FeedbackId.TakeTallySourceVideo,
        FeedbackId.TakeTallySourceAudio,
        FeedbackId.TakeTallySourceData,
        FeedbackId.TakeTallySourceMultiChannelAudio,
        FeedbackId.TakeTallySourceGPIO,
        FeedbackId.SelectedSourceVideo,
        FeedbackId.SelectedSourceAudio,
        FeedbackId.SelectedSourceData,
        FeedbackId.SelectedSourceMultiChannelAudio,
        FeedbackId.SelectedSourceGPIO,
        FeedbackId.RoutingTallyVideo,
        FeedbackId.RoutingTallyAudio,
        FeedbackId.RoutingTallyData,
        FeedbackId.RoutingTallyMultiChannelAudio,
        FeedbackId.RoutingTallyGPIO,
        FeedbackId.Take,
        FeedbackId.Clear,
        FeedbackId.Undo
      )
      updateSelectedTargetVariables(self, state)
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
  self: InstanceBase<DeviceConfig>,
  emberClient: EmberClient,
  config: DeviceConfig,
  state: DeviceState
): CompanionActionDefinitions {
  const { inputChoices, outputChoices } = getInputChoices(state)

  const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
    [ActionId.Take]: {
      name: 'Take',
      options: [],
      callback: doTake(self, emberClient, config, state)
    },
    [ActionId.Clear]: {
      name: 'Clear',
      options: [],
      callback: doClear(self, state)
    },
    [ActionId.Undo]: {
      name: 'Undo',
      options: [],
      callback: doUndo(self, emberClient, config, state)
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
        {
          type: 'checkbox',
          label: 'Direct Take',
          id: 'do_take',
          default: false,
          isVisible: (options): boolean => {
            return !(options['source'] === 'next' || options['source'] === 'previous')
          }

        }
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.video)
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
        }
      ],
      callback: setSelectedTarget(self, state, matrixnames.video)
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
        {
          type: 'checkbox',
          label: 'Direct Take',
          id: 'do_take',
          default: false,
          isVisible: (options): boolean => {
            return !(options['source'] === 'next' || options['source'] === 'previous')
          }
        }
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.audio)
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
        }
      ],
      callback: setSelectedTarget(self, state, matrixnames.audio)
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
        {
          type: 'checkbox',
          label: 'Direct Take',
          id: 'do_take',
          default: false,
          isVisible: (options): boolean => {
            return !(options['source'] === 'next' || options['source'] === 'previous')
          }
        }
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.data)
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
        }
      ],
      callback: setSelectedTarget(self, state, matrixnames.data)
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
        {
          type: 'checkbox',
          label: 'Direct Take',
          id: 'do_take',
          default: false,
          isVisible: (options): boolean => {
            return !(options['source'] === 'next' || options['source'] === 'previous')
          }
        }
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.multichannelaudio)
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
        }
      ],
      callback: setSelectedTarget(self, state, matrixnames.multichannelaudio)
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
        {
          type: 'checkbox',
          label: 'Direct Take',
          id: 'do_take',
          default: false,
          isVisible: (options): boolean => {
            return !(options['source'] === 'next' || options['source'] === 'previous')
          }
        }
      ],
      callback: setSelectedSource(self, emberClient, config, state, matrixnames.gpio)
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
        }
      ],
      callback: setSelectedTarget(self, state, matrixnames.gpio)
    }
  }

  return actions
}
