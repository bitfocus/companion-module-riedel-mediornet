import {
  CompanionActionDefinition,
  CompanionActionDefinitions,
  CompanionActionEvent,
  InstanceBase
} from '@companion-module/base'
import { DeviceConfig } from './config'
import { FeedbackId } from './feedback'
import { matrixnames, DeviceState } from './state'
import { getChoices } from './choices'
import { updateSelectedTargetVariables } from './variables'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'
import { QualifiedMatrix } from 'node-emberplus/lib/common/matrix/qualified-matrix'

export enum ActionId {
  Take = 'take',
  Clear = 'clear',
  Undo = 'undo',
  SetSource = 'select_source',
  SetTarget = 'select_target',
  SetMatrix = 'select_matrix',
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
            //self.log('debug', 'Got node on ' + state.matrices[state.selected.matrix].label)
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
            FeedbackId.SelectedTarget,
            FeedbackId.TakeTallySource,
            FeedbackId.SelectedSource,
            FeedbackId.RoutingTally,
            FeedbackId.SelectedMatrix,
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
    (): void => {
      if (state.selected.target !== -1 && state.selected.source !== -1 && state.selected.matrix !== -1) {
        self.log(
          'debug',
          'TAKE: selectedDest: ' +
          state.selected.target +
          ' selected.source: ' +
          state.selected.source +
          ' on matrix ' +
          state.selected.matrix
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
    FeedbackId.SelectedTarget,
    FeedbackId.TakeTallySource,
    FeedbackId.SelectedSource,
    FeedbackId.RoutingTally,
    FeedbackId.SelectedMatrix,
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
      FeedbackId.SelectedTarget,
      FeedbackId.TakeTallySource,
      FeedbackId.SelectedSource,
      FeedbackId.RoutingTally,
      FeedbackId.SelectedMatrix,
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
  ) =>
    (action: CompanionActionEvent): void => {
      let check_continue = false

      if (Boolean(action.options['next_previous_action'])) {
        if (action.options['next_previous'] === 'next' || action.options['next_previous'] === 'previous') {
          let tempList = state.matrices[state.selected.matrix].inputList
          let index = tempList.findIndex((value) => value == state.selected.source)

          if (state.selected.source == -1) state.selected.source = tempList[0]
          else if (index < tempList.length - 1 && action.options['next_previous'] === 'next') state.selected.source = tempList[index + 1]
          else if (0 < index && action.options['next_previous'] === 'previous') state.selected.source = tempList[index - 1]


          check_continue = true
        }
      } else {
        let matrix = Number(action.options['matrix'])
        let source = Number(action.options[`source_${matrix}`])
        if (!Number.isNaN(matrix) && !Number.isNaN(source) && matrix == state.selected.matrix) {
          state.selected.source = source
          self.log('debug', 'Take is: ' + config.take)
          if (config.take || action.options['do_take']) doMatrixActionFunction(self, emberClient, config, state)
          check_continue = true
        }
      }

      if (check_continue) {
        self.checkFeedbacks(
          FeedbackId.SelectedSource,
          FeedbackId.RoutingTally,
          FeedbackId.Take,
          FeedbackId.Clear
        )
        updateSelectedTargetVariables(self, state)
        self.log(
          'debug',
          'setSelectedSource: ' + state.selected.source + ' on Matrix: ' + state.matrices[state.selected.matrix].label
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
  (self: InstanceBase<DeviceConfig>, state: DeviceState) =>
    (action: CompanionActionEvent): void => {
      if (Boolean(action.options['next_previous_action'])) {
        if (action.options['next_previous'] === 'next' || action.options['next_previous'] === 'previous') {
          let tempList = state.matrices[state.selected.matrix].outputList
          let index = tempList.findIndex((value) => value == state.selected.target)

          if (state.selected.target == -1) state.selected.target = tempList[0]
          else if (index < tempList.length - 1 && action.options['next_previous'] === 'next') state.selected.target = tempList[index + 1]
          else if (0 < index && action.options['next_previous'] === 'previous') state.selected.target = tempList[index - 1]


          state.selected.source = Number(state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route)
          if (Number.isNaN(state.selected.source)) state.selected.source = tempList[0]
        }
      } else {
        let matrix = Number(action.options['matrix'])
        let target = action.options[`target_${matrix}`]
        if (!Number.isNaN(matrix)) {
          if (target != -1) {
            state.selected.target = Number(target)
            state.selected.matrix = matrix
            state.selected.source = Number(state.matrices[matrix].outputs.get(Number(target))?.route)
          }
        }
      }

      self.checkFeedbacks(
        FeedbackId.SelectedTarget,
        FeedbackId.TakeTallySource,
        FeedbackId.SelectedSource,
        FeedbackId.RoutingTally,
        FeedbackId.SelectedMatrix,
        FeedbackId.Take,
        FeedbackId.Clear,
        FeedbackId.Undo
      )
      updateSelectedTargetVariables(self, state)
      self.log('debug', 'setSelectedTarget: ' + state.selected.target + ' on Matrix: ' + state.matrices[state.selected.matrix].label)

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
const setSelectedMatrix =
  (
    self: InstanceBase<DeviceConfig>,
    state: DeviceState
  ) =>
    (action: CompanionActionEvent): void => {
      let matrix = Number(action.options['matrix'])
      if (!Number.isNaN(matrix)) {
        state.selected.matrix = matrix
        let tempList = state.matrices[state.selected.matrix].outputList
        state.selected.target = tempList[0]
        state.selected.source = Number(state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.route)
        self.checkFeedbacks(
          FeedbackId.SelectedTarget,
          FeedbackId.TakeTallySource,
          FeedbackId.SelectedSource,
          FeedbackId.RoutingTally,
          FeedbackId.SelectedMatrix,
          FeedbackId.Take,
          FeedbackId.Clear,
          FeedbackId.Undo
        )
        updateSelectedTargetVariables(self, state)
      }
      self.log(
        'debug',
        'setSelectedMatrix: ' + state.matrices[matrix].label
      )

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
  const { inputChoices, outputChoices, matrixChoices, nextPreviousChoices } = getChoices(state)

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
    [ActionId.SetSource]: {
      name: 'Select Source',
      description: 'Select a source of a matrix or select next or previous source of currently selected matrix.',
      options: [
        {
          id: 'next_previous_action',
          type: 'checkbox',
          label: 'NEXT/PREVIOUS Action',
          default: false
        },
        {
          id: 'next_previous',
          type: 'dropdown',
          label: 'Next or Previous',
          default: 'next',
          choices: nextPreviousChoices,
          isVisible: (options) => {
            return (options['next_previous_action'] == true)
          }
        },
        {
          type: 'checkbox',
          label: 'Direct Take',
          id: 'do_take',
          default: false,
          isVisible: (options) => {
            return (options['next_previous_action'] == false)
          }
        },
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices,
          isVisible: (options) => {
            return (options['next_previous_action'] == false)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.video].label} Source`,
          id: `source_${matrixnames.video}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video],
          isVisible: (options) => {
            return (options['next_previous_action'] == false && options['matrix'] == 0)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.audio].label} Target`,
          id: `source_${matrixnames.audio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.audio],
          isVisible: options => {
            return (options['next_previous_action'] == false && options['matrix'] == 1)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.data].label} Target`,
          id: `source_${matrixnames.data}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.data],
          isVisible: options => {
            return (options['next_previous_action'] == false && options['matrix'] == 2)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.multichannelaudio].label} Target`,
          id: `source_${matrixnames.multichannelaudio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.multichannelaudio],
          isVisible: options => {
            return (options['next_previous_action'] == false && options['matrix'] == 3)
          }
        },
        {
          type: 'dropdown',
          label: `${state.matrices[matrixnames.gpio].label} Target`,
          id: `source_${matrixnames.gpio}`,
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.gpio],
          isVisible: options => {
            return (options['next_previous_action'] == false && options['matrix'] == 4)
          }
        }
      ],
      callback: setSelectedSource(self, emberClient, config, state)
    },
    [ActionId.SetTarget]: {
      name: 'Select Target',
      options: [
        {
          id: 'next_previous_action',
          type: 'checkbox',
          label: 'NEXT/PREVIOUS Action',
          default: false
        },
        {
          id: 'next_previous',
          type: 'dropdown',
          label: 'Next or Previous',
          default: 'next',
          choices: nextPreviousChoices,
          isVisible: (options) => {
            return (options['next_previous_action'] == true)
          }
        },
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices,
          isVisible: (options) => {
            return (options['next_previous_action'] == false)
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
            return (options['next_previous_action'] == false && options['matrix'] == 0)
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
            return (options['next_previous_action'] == false && options['matrix'] == 1)
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
            return (options['next_previous_action'] == false && options['matrix'] == 2)
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
            return (options['next_previous_action'] == false && options['matrix'] == 3)
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
            return (options['next_previous_action'] == false && options['matrix'] == 4)
          }
        }
      ],
      callback: setSelectedTarget(self, state)
    },

    [ActionId.SetMatrix]: {
      name: 'Select Matrix',
      description: 'Choose a matrix. This way you can use the NEXT and PREVIOUS Actions to select targets and sources.',
      options: [
        {
          type: 'dropdown',
          label: 'Matrix',
          id: 'matrix',
          default: 0,
          minChoicesForSearch: 10,
          choices: matrixChoices
        }
      ],
      callback: setSelectedMatrix(self, state)
    }
  }

  return actions
}
