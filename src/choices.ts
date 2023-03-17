import type {DropdownChoice} from '@companion-module/base'
import type {MediornetState} from './state'

export interface InputChoicesResult {
  inputChoices: DropdownChoice[][]
  outputChoices: DropdownChoice[][]
  matrixChoices: DropdownChoice[]
}

/**
 * INTERNAL: use model data to define the choices for the dropdowns.
 */
export function getInputChoices(state: MediornetState): InputChoicesResult {
  const result: InputChoicesResult = {
    inputChoices: [],
    outputChoices: [],
    matrixChoices: [],
  }
  for (let i = 0; i < state.matrices.length; i++) {
    result.inputChoices[i] = []
    for (const input of state.iterateInputs(i)) {
      //if (input.status != 'None') {
        result.inputChoices[i].push({id: input.id, label: input.label})
      //}
    }
  }
  for (let i = 0; i < state.matrices.length; i++) {
    result.outputChoices[i] = []
    for (const output of state.iterateOutputs(i)) {
     // if (output.status != 'None') {
        result.outputChoices[i].push({id: output.id, label: output.label})
     // }
    }
  }

    for (const matrix of state.matrices) {
      result.matrixChoices.push({id: matrix.id, label: matrix.label})
  }
  return result
}