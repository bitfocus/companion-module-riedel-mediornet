import type { DropdownChoice } from '@companion-module/base'
import type { DeviceState } from './state'

export interface InputChoicesResult {
  inputChoices: DropdownChoice[][]
  outputChoices: DropdownChoice[][]
  matrixChoices: DropdownChoice[]
  nextPreviousChoices: DropdownChoice[]
}

/**
 * Returns InputChoices for Actions and Feedbacks.
 * @param state reference to the BaseInstance
 */
export function getChoices(state: DeviceState): InputChoicesResult {
  const result: InputChoicesResult = {
    inputChoices: [],
    outputChoices: [],
    matrixChoices: [],
    nextPreviousChoices: []
  }

  result.nextPreviousChoices.push({ id: 'next', label: 'NEXT' }, { id: 'previous', label: 'PREVIOUS' })

  for (let i = 0; i < state.matrices.length; i++) {
    result.inputChoices[i] = []
    result.outputChoices[i] = []
    result.matrixChoices[i] = { id: i, label: state.matrices[i].label }

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
