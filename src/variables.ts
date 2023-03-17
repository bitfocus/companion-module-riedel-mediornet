import type {CompanionVariableDefinition, CompanionVariableValues, InstanceBase} from '@companion-module/base'
import type {MediornetConfig} from './config.js'
import type {MediornetState} from './state.js'

/**
 * Initialize variables.
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

      variableValues[`output_${state.matrices[i].label}_${output.id + 1}_input`] = state.getInput(output.route, i)?.name ?? '?'
      //}
    }
  }

  variableDefinitions.push({
    name: 'Label of selected destination',
    variableId: 'selected_destination',
  })

  variableDefinitions.push({
    name: 'Label of input routed to selection',
    variableId: 'selected_source',
  })

  updateSelectedDestinationVariables(state, variableValues)

  self.setVariableDefinitions(variableDefinitions)
  self.setVariableValues(variableValues)
}

export function updateSelectedDestinationVariables(
  state: MediornetState,
  variableValues: CompanionVariableValues
): void {
  for (let i = 0; i < state.matrices.length; i++) {
    const selectedOutput = state.getSelectedOutput(i)
    const inputForSelectedOutput = selectedOutput ? state.getInput(selectedOutput.route, i) : undefined

    variableValues['selected_destination'] = selectedOutput?.name ?? '?'

    variableValues['selected_source'] = inputForSelectedOutput?.name ?? '?'
  }
}