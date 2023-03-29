import type { CompanionVariableDefinition, CompanionVariableValues, InstanceBase } from '@companion-module/base'
import type { MediornetConfig } from './config'
import type { MediornetState } from './state'

/**
 * Initializes all variables
 * @param self reference to the BaseInstance
 * @param state reference to the modules state
 */
export function initVariables(self: InstanceBase<MediornetConfig>, state: MediornetState): void {
  const variableDefinitions: CompanionVariableDefinition[] = []
  const variableValues: CompanionVariableValues = {}

  for (let i = 0; i < state.matrices.length; i++) {
    for (const input of state.iterateInputs(i)) {
      //if (input.status != 'None') {
      variableDefinitions.push({
        name: `Label of input ${state.matrices[i].label} ${input.id + 1}`,
        variableId: `input_${state.matrices[i].label}_${input.id + 1}`,
      })

      variableValues[`input_${state.matrices[i].label}_${input.id + 1}`] = input.name
      //}
    }
  }

  for (let i = 0; i < state.matrices.length; i++) {
    for (const output of state.iterateOutputs(i)) {
      //if (output.status != 'None') {
      variableDefinitions.push({
        name: `Label of output ${state.matrices[i].label} ${output.id + 1}`,
        variableId: `output_${state.matrices[i].label}_${output.id + 1}`,
      })

      variableValues[`output_${state.matrices[i].label}_${output.id + 1}`] = output.name

      variableDefinitions.push({
        name: `Label of input routed to ${state.matrices[i].label} output ${output.id + 1}`,
        variableId: `output_${state.matrices[i].label}_${output.id + 1}_input`,
      })

      variableValues[`output_${state.matrices[i].label}_${output.id + 1}_input`] =
        state.getInput(output.route, i)?.name ?? '?'
      //}
    }
  }

  variableDefinitions.push({
    name: 'Label of selected destination',
    variableId: 'selected_target',
  })

  variableDefinitions.push({
    name: 'Label of input routed to selection',
    variableId: 'selected_target_source',
  })

  variableDefinitions.push({
    name: 'Label of undo source',
    variableId: 'selected_target_undo_source',
  })


  updateSelectedTargetVariables(self, state)

  self.setVariableDefinitions(variableDefinitions)
  self.setVariableValues(variableValues)
}

export function updateSelectedTargetVariables(self: InstanceBase<MediornetConfig>, state: MediornetState): void {
  const selectedOutput = state.selected.matrix != -1 ? state.getSelectedOutput(state.selected.matrix) : undefined
  const inputForSelectedOutput = selectedOutput
    ? state.getInput(selectedOutput.route, state.selected.matrix)
    : undefined
  const variableValues: CompanionVariableValues = {}

  variableValues['selected_target'] = selectedOutput?.name ?? '?'

  variableValues['selected_target_source'] = inputForSelectedOutput?.name ?? '?'

  const selOut = state.outputs[state.selected.matrix][state.selected.target]
  variableValues['selected_target_undo_source'] = selOut.fallback[selOut.fallback.length-2] ?? '?'

  self.setVariableValues(variableValues)
}
