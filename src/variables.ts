import type { CompanionVariableDefinition, CompanionVariableValues, InstanceBase } from '@companion-module/base'
import type { DeviceConfig } from './config'
import type { DeviceState } from './state'

/**
 * Initializes all variables
 * @param self reference to the BaseInstance
 * @param state reference to the modules state
 */
export function initVariables(self: InstanceBase<DeviceConfig>, state: DeviceState): void {
  const variableDefinitions: CompanionVariableDefinition[] = []
  const variableValues: CompanionVariableValues = {}

  for (let i = 0; i < state.matrices.length; i++) {
    state.iterateInputs(i).forEach((input, key) => {
      if (input.active) {
        variableDefinitions.push({
          name: `Label of input ${state.matrices[i].label} ${key + 1}`,
          variableId: `input_${state.matrices[i].variableName}_${key + 1}`
        })


        variableValues[`input_${state.matrices[i].variableName}_${key + 1}`] = input.label
      }
    }
    )
  }

  for (let i = 0; i < state.matrices.length; i++) {
    state.iterateOutputs(i).forEach((output, key) => {
      if (output.active) {
        variableDefinitions.push({
          name: `Label of output ${state.matrices[i].label} ${key + 1}`,
          variableId: `output_${state.matrices[i].variableName}_${key + 1}`
        })

        variableValues[`output_${state.matrices[i].variableName}_${key + 1}`] = output.label

        variableDefinitions.push({
          name: `Label of input routed to ${state.matrices[i].label} output ${key + 1}`,
          variableId: `output_${state.matrices[i].variableName}_${key + 1}_input`
        })

        variableDefinitions.push({
          name: `ID of input routed to ${state.matrices[i].label} output ${key + 1}`,
          variableId: `output_${state.matrices[i].variableName}_${key + 1}_input_id`
        })

        const activeInputIdx = output.route

        variableValues[`output_${state.matrices[i].variableName}_${key + 1}_input`] =
          state.getInput(activeInputIdx, i)?.label ?? '?'

        variableValues[`output_${state.matrices[i].variableName}_${key + 1}_input_id`] =
          activeInputIdx + 1
      }
    }
    )
  }

  variableDefinitions.push({
    name: 'Label of selected destination',
    variableId: 'selected_target'
  })

  variableDefinitions.push({
    name: 'Label of input routed to selection',
    variableId: 'selected_target_source'
  })
  variableDefinitions.push({
    name: 'Label of selected source',
    variableId: 'selected_source'
  })

  variableDefinitions.push({
    name: 'Label of undo source',
    variableId: 'selected_target_undo_source'
  })

  variableValues['selected_source'] = '?'

  updateSelectedTargetVariables(self, state)

  self.setVariableDefinitions(variableDefinitions)
  self.setVariableValues(variableValues)
}

export function updateSelectedTargetVariables(self: InstanceBase<DeviceConfig>, state: DeviceState): void {
  const variableValues: CompanionVariableValues = {}
  if (state.selected.matrix != -1 && state.selected.target != -1) {
    const selectedOutput = state.matrices[state.selected.matrix].outputs.get(state.selected.target)
    const inputForSelectedOutput = selectedOutput
      ? state.getInput(selectedOutput.route, state.selected.matrix)
      : undefined

    variableValues['selected_target'] = selectedOutput?.label ?? '?'
    variableValues['selected_source'] = state.matrices[state.selected.matrix].inputs.get(state.selected.source)?.label

    variableValues['selected_target_source'] = inputForSelectedOutput?.label ?? '?'
    let fallback_length = state.matrices[state.selected.matrix].outputs.get(state.selected.target)?.fallback.length
    if (fallback_length != undefined && fallback_length >= 2) {
      const selOut = state.matrices[state.selected.matrix].outputs.get(state.selected.target)
      if (selOut != undefined) variableValues['selected_target_undo_source'] =
        state.matrices[state.selected.matrix].inputs.get(selOut.fallback[selOut.fallback.length - 2])?.label ?? ''
    } else {
      variableValues['selected_target_undo_source'] = ''
    }
  } else {
    variableValues['selected_target'] = '?'
    variableValues['selected_target_source'] = '?'
    variableValues['selected_target_undo_source'] = ''
    variableValues['selected_source'] = '?'
  }

  self.setVariableValues(variableValues)
}


export function updateSpecificTargetVariables(self: InstanceBase<DeviceConfig>, state: DeviceState, options: { matrix: number, target: number }): void {
  const { matrix, target } = options
  const variableValues: CompanionVariableValues = {}

  if (matrix != -1 && target != -1) {
    return
  }

  const targetObject = state.matrices[matrix].outputs.get(target)
  const inputIdx = targetObject?.route
  const inputForTarget = targetObject
    ? state.getInput(inputIdx, matrix)
    : undefined

  const matrixLabel = state.matrices[matrix].variableName
  variableValues[`output_${matrixLabel}_${target + 1}`] = targetObject?.label ?? '?'
  variableValues[`output_${matrixLabel}_${target + 1}_input`] = inputForTarget?.label ?? '?'
  variableValues[`output_${matrixLabel}_${target + 1}_input_id`] = inputIdx + 1

  self.setVariableValues(variableValues)
}
