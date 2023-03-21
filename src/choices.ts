import type { DropdownChoice } from '@companion-module/base'
import type { MediornetState } from './state'

export interface InputChoicesResult {
  inputChoices: DropdownChoice[][]
  outputChoices: DropdownChoice[][]
}

/**
 * Returns InputChoices for Actions and Feedbacks.
 * @param state reference to the BaseInstance
 */
export function getInputChoices(state: MediornetState): InputChoicesResult {
  const result: InputChoicesResult = {
    inputChoices: [],
    outputChoices: [],
  }
  for (let i = 0; i < state.matrices.length; i++) {
    result.inputChoices[i] = []
    for (const input of state.iterateInputs(i)) {
      if (input.active) {
        result.inputChoices[i].push({ id: input.id, label: input.label })
      }
    }
  }
  for (let i = 0; i < state.matrices.length; i++) {
    result.outputChoices[i] = []
    for (const output of state.iterateOutputs(i)) {
      if (output.active) {
        result.outputChoices[i].push({ id: output.id, label: output.label })
      }
    }
  }

  return result
}
