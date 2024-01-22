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
    outputChoices: []
  }
  for (let i = 0; i < state.matrices.length; i++) {
    result.inputChoices[i] = []
    result.outputChoices[i] = []
    state.iterateInputs(i).forEach((value, key) => {
        if (value.active) {
          result.inputChoices[i].push({ id: key, label: value.label })
        }
      }
    )
    state.iterateOutputs(i).forEach((value, key) => {
        if (value.active) {
          result.outputChoices[i].push({ id: key, label: value.label })
        }
      }
    )
  }
  return result
}
