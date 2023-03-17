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
  SetSelectedSource = 'setSelectedSource',
  SetSelectedTarget = 'setSelectedTarget',
}

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
        // TODO - do we handle not found?
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

const setSelectedSource =
  (self: InstanceBase<MediornetConfig>, emberClient: EmberClient, config: MediornetConfig, state: MediornetState) =>
    (action: CompanionActionEvent): void => {
      if (action.options['source'] != -1 && action.options['matrix'] != -1) {
        state.selectedSource[Number(action.options['matrix'])] = Number(action.options['source'])
      }
      self.log('debug', 'Take is: ' + config.take)
      if (config.take) doMatrixActionFunction(self, emberClient, state, Number(action.options['matrix']))
      self.checkFeedbacks(FeedbackId.SourceBackgroundSelected)
      self.log('debug', 'setSelectedSource: ' + action.options['source'] + ' on Matrix: ' + action.options['matrix'])
    }

const setSelectedTarget =
  (self: InstanceBase<MediornetConfig>, state: MediornetState) =>
    (action: CompanionActionEvent): void => {
      if (action.options['target'] != -1 && action.options['matrix'] != -1 && state.selectedDestination) {
        state.selectedDestination[Number(action.options['matrix'])] = Number(action.options['target'])
      }
      self.checkFeedbacks(FeedbackId.TargetBackgroundSelected)
      self.log('debug', 'setSelectedTarget: ' + action.options['target'] + ' on Matrix: ' + action.options['matrix'])
    }

export function GetActionsList(
  self: InstanceBase<MediornetConfig>,
  emberClient: EmberClient,
  config: MediornetConfig,
  state: MediornetState
): CompanionActionDefinitions {

  const { inputChoices, outputChoices, matrixChoices } = getInputChoices(state)

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
    [ActionId.SetSelectedSource]: {
      name: 'Set Selected Source',
      options: [
        {
          type: 'dropdown',
          label: 'Select Matrix Number',
          id: 'matrix',
          default: 0,
          choices: matrixChoices
        },
        {
          type: 'dropdown',
          label: 'Value',
          id: 'source',
          default: 0,
          minChoicesForSearch: 10,
          choices: inputChoices[matrixnames.video]
        },
      ],
      callback: setSelectedSource(self, emberClient, config, state),
    },
    [ActionId.SetSelectedTarget]: {
      name: 'Set Selected Target',
      options: [
        {
          type: 'dropdown',
          label: 'Select Matrix Number',
          id: 'matrix',
          default: 0,
          choices: matrixChoices
        },
        {
          type: 'dropdown',
          label: 'Value',
          id: 'target',
          default: 0,
          minChoicesForSearch: 10,
          choices: outputChoices[matrixnames.video]
        },
      ],
      callback: setSelectedTarget(self, state),
    },
  }

  return actions
}
