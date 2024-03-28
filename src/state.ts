import { DeviceConfig } from './config'
import { MediornetInstance } from './index'
import { QualifiedMatrix } from 'node-emberplus/lib/common/matrix/qualified-matrix'
import { QualifiedNode } from 'node-emberplus/lib/common/qualified-node'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'
import { QualifiedParameter } from 'node-emberplus/lib/common/qualified-parameter'
import { CompanionVariableValues } from '@companion-module/base'
import * as console from 'console'
import { FeedbackId } from './feedback'

export enum matrixnames {
  video,
  audio,
  data,
  multichannelaudio,
  gpio,
}

const videoPath = '1.2.0.3'
const audioPath = '1.2.1.3'
const dataPath = '1.2.2.3'
const multiChannelAudioPath = '1.2.3.3'
const gpioPath = '1.2.4.3'

export interface Matrix {
  id: number
  label: string
  variableName: string
  path: string
  inputs: Map<number, InputState>
  outputs: Map<number, OutputState>
  inputList: number[]
  outputList: number[]
}

export interface CurrentSelected {
  target: number
  source: number
  matrix: number
}

export interface InputState {
  label: string
  name: string
  active: boolean
}

export interface OutputState {
  label: string
  name: string
  route: number
  active: boolean
  lock: boolean
  fallback: number[]
}

export class DeviceState {
  self: MediornetInstance
  selected: CurrentSelected
  matrices: Matrix[]

  constructor(self: MediornetInstance) {
    this.self = self
    this.selected = {
      source: -1,
      target: -1,
      matrix: -1
    }
    this.matrices = [
      { id: 0, label: 'Video', variableName: 'video', path: videoPath, inputs: new Map(), outputs: new Map() , inputList : [], outputList : []},
      { id: 1, label: 'Audio',  variableName: 'audio', path: audioPath, inputs: new Map(), outputs: new Map() , inputList : [], outputList : []},
      { id: 2, label: 'Data', variableName: 'data', path: dataPath, inputs: new Map(), outputs: new Map() , inputList : [], outputList : []},
      { id: 3, label: 'Multi Channel Audio', variableName: 'multichannelaudio', path: multiChannelAudioPath, inputs: new Map(), outputs: new Map() , inputList : [], outputList : []},
      { id: 4, label: 'GPIO', variableName: 'gpio', path: gpioPath, inputs: new Map(), outputs: new Map() , inputList : [], outputList : []}
    ]
  }

  public updateOfflineMatrix(config: DeviceConfig): void {
    const inputCount = config.inputCountString.split(',').map(Number)
    const outputCount = config.outputCountString.split(',').map(Number)

    for (let i = 0; i < this.matrices.length; i++) {
      for (let id = 0; id < inputCount[i]; id++) {
        this.matrices[i].inputs.set(id, {
          label: `Input ${id + 1}`,
          name: `Input ${id + 1}`,
          active: true
        })
      }
      for (let id = 0; id < outputCount[i]; id++) {
        this.matrices[i].outputs.set(id, {
          label: `Output ${id + 1}`,
          name: `Output ${id + 1}`,
          active: true,
          route: 0,
          fallback: [],
          lock: false
        })
      }
    }
  }

  /**
   * INTERNAL: returns the desired input object.
   *
   * @param id - the input to fetch
   * @param matrix - number of wanted matrix
   * @returns the desired input object
   */
  public getInput(id: number, matrix: number): InputState | undefined {
    return this.matrices[matrix].inputs.get(id)
  }

  /**
   * INTERNAL: returns the desired output object.
   *
   * @param id - the output to fetch
   * @param matrix - number of wanted matrix
   * @returns the desired output object
   */
  public getOutputById(id: number, matrix: number): OutputState | undefined {
    return this.matrices[matrix].outputs.get(id)
  }

  /**
   * Returns the currently selected Output, if it is of the same matrix.
   * @param matrix the matrix id to check against the selected Output
   */
  public getSelectedOutput(matrix: number): OutputState | undefined {
    return this.selected.target !== undefined && this.selected.matrix == matrix
      ? this.getOutputById(this.selected.target, matrix)
      : undefined
  }

  /**
   * Returns all Inputs of a specified matrix.
   * @param matrix the matrix which inputs are wanted
   */
  public iterateInputs(matrix: number): Map<number, InputState> {
    return this.matrices[matrix].inputs
  }

  /**
   * Returns all Outputs of a specified matrix.
   * @param matrix the matrix which outputs are wanted
   */
  public iterateOutputs(matrix: number): Map<number, OutputState> {
    return this.matrices[matrix].outputs
  }


  /**
   * This function expects a path to possible labels for a specified matrix
   * It checks, wether the path is valid, and writes all recieved labels into the inputs and outputs.
   * For coming updates, each labelPath is subscribed with a callback function.
   * @param labelPath path to potential Labels
   * @param matrix_index index of matrix for which the labels are used
   * @param emberClient reference to the emberClient
   */
  async getLabels(labelPath: string, matrix_index: number, emberClient: EmberClient): Promise<void> {


    let node = await emberClient.getElementByPathAsync(labelPath).then(
      async (tempNode) => {
        await emberClient.getDirectoryAsync(tempNode).then().catch((e)=>this.self.log('error', 'Error on getLabels: ' + e))
        return tempNode
      })
      .catch((error) => {
        this.self.log('error', labelPath + ': Node does not exist. There are no labels for matrix: ' + matrix_index + ' Error: ' + error)
        return null
      })
    if (node != null && node instanceof QualifiedNode) {

      let labelTargetList: Map<number, InputState | OutputState>
      let labelTargetGroup: string
      if (node.identifier == 'targets') {
        labelTargetList = this.matrices[matrix_index].outputs
        labelTargetGroup = 'output'
      } else {
        labelTargetList = this.matrices[matrix_index].inputs
        labelTargetGroup = 'input'
      }

      const variableValues: CompanionVariableValues = {}

      if (node.elements != undefined) {
        node.elements.forEach((value, key) => {
          if (value instanceof QualifiedParameter && key != undefined) {
            let numKey = key as number
            let labelTarget = labelTargetList.get(numKey)
            if (typeof value.identifier == 'string' && typeof value.value == 'string' && labelTarget != undefined) {
              labelTarget.name = value.identifier
              labelTarget.label = value.value
              variableValues[`${labelTargetGroup}_${this.matrices[matrix_index].variableName}_${numKey + 1}`] =
                labelTarget.label
            }


            emberClient.getElementByPathAsync(value.path, (update) => {
              if (update instanceof QualifiedParameter) {
                if (labelTarget != undefined) {
                  labelTarget.label = update.value as string
                  const variableValuesnew: CompanionVariableValues = {}
                  variableValuesnew[`${labelTargetGroup}_${this.matrices[matrix_index].variableName}_${numKey + 1}`] =
                    labelTarget.label
                  if (labelTargetGroup == 'input') {
                    this.matrices[matrix_index].outputs.forEach((value, key) => {
                      if (value.route == numKey) {
                        console.log(value)
                        variableValuesnew[`output_${this.matrices[matrix_index].variableName}_${key + 1}_input`] =
                          labelTarget?.label ?? '?'
                      }
                    })
                  }
                  this.self.setVariableValues(variableValuesnew)
                }
              }
            })
              .catch((error) => {
                emberClient.emit('error', 'Error on SetLabelUpdate: ' + error)
              })
          }
        })
        this.self.setVariableValues(variableValues)
      }
    }
  }

  /**
   * Initially reads all wanted values from the Mediornet.
   * Callbacks are given for wanted updates.
   */
  public async subscribeDevice(): Promise<void> {
    if (this.self.emberClient.isConnected()) {
      this.self.log('debug', 'is connected!!!')
      const inputs = this.self.config.inputCountString.split(',')
      const outputs = this.self.config.outputCountString.split(',')

      //MATRIX ----------------
      // Iterate init Process for each matrix
      for (let i = 0; i < this.matrices.length; i++) {
        const matrix = this.matrices[i]
        const matrixNode = await this.self.emberClient
          .getElementByPathAsync(matrix.path)
          .then(async (node) => {
            return node
          })
          .catch((err) => this.self.log('error', matrix.path + ': Node does not exist. There is no matrix. ' + err))

        //check Node for properties of a matrixNode
        if (matrixNode instanceof QualifiedMatrix) {
          //Update Counts
          inputs[i] = matrixNode.sources?.length != undefined ? String(matrixNode.sources.length) : '0'
          outputs[i] = matrixNode.targets?.length != undefined ? String(matrixNode.targets.length) : '0'
          this.self.config.inputCountString = inputs.join(',')
          this.self.config.outputCountString = outputs.join(',')

          this.matrices[i].inputs = new Map<number, InputState>()
          this.matrices[i].outputs = new Map<number, OutputState>()

          if (matrixNode.sources?.length != 0 && matrixNode.targets?.length != 0) {

            matrixNode.sources?.forEach((index) => {
              this.matrices[i].inputs.set(index, {
                label: `Input ${index + 1}`,
                name: `Input ${index + 1}`,
                active: true
              })
            })
            matrixNode.targets?.forEach((index) => {
              this.matrices[i].outputs.set(index, {
                label: `Output ${index + 1}`,
                name: `Output ${index + 1}`,
                active: true,
                route: 1001,
                fallback: [],
                lock: false
              })
            })

            this.matrices[i].inputList = Array.from(this.matrices[i].inputs.keys())
            this.matrices[i].inputList.sort((a, b) => a - b)

            this.matrices[i].outputList = Array.from(this.matrices[i].outputs.keys())
            this.matrices[i].outputList.sort((a, b) => a - b)



            //Set callback for matrix to update internal matrix connection infos
            await this.self.emberClient.getDirectoryAsync(matrixNode, (matrixUpdate) => {
              if (matrixUpdate instanceof QualifiedMatrix && matrixUpdate.connections != null) {

                for (let connectionsKey in matrixUpdate.connections) {
                  const sources = matrixUpdate.connections[connectionsKey].sources
                  let matrixElement = this.matrices[i].outputs.get(Number(connectionsKey))
                  //console.log('key: ' + connectionsKey + ' sources: '+ sources + ' matrixElement: ' + JSON.stringify(matrixElement))


                  if (sources != undefined && matrixElement != undefined && matrixElement.route != sources[0]) {
                    matrixElement.route = sources[0]
                    matrixElement.fallback.push(sources[0])
                    this.self.checkFeedbacks(
                      FeedbackId.TakeTallySource,
                      FeedbackId.RoutingTally,
                      FeedbackId.Take,
                      FeedbackId.Undo
                    )
                    const variableValuesnew: CompanionVariableValues = {}
                    variableValuesnew[`output_${this.matrices[i].variableName}_${Number(connectionsKey) + 1}_input`] =
                      this.getInput(sources[0], i)?.label ?? '?'
                    this.self.setVariableValues(variableValuesnew)
                  } // if sources != undefined
                }
              } //if 'connections' in matrixUpdate
            }) // end getDirectory
              .catch((error) => {
                this.self.emberClient.emit('error', 'Error on getUpdatesOnConnections: ' + error)
              })


            //Recieve Labels
            if (matrixNode.labels != null) {
              const labelPath = matrixNode.labels[0].basePath
              const labelNode = await this.self.emberClient
                .getElementByPathAsync(labelPath)
                .then(async (node) => {
                  if (node != undefined) return await this.self.emberClient.getDirectoryAsync(node)
                  else return undefined
                })
                .catch((error) =>
                  console.log(labelPath + ': Node does not exist. There are no labels for matrix: ' + matrix.path + ' Error: ' + error)
                )
              if (labelNode?.hasChildren()) {
                labelNode?.elements.forEach((child) => {
                  if (child instanceof QualifiedNode) {
                    this.getLabels(child.path, i, this.self.emberClient)
                  }
                })
              } // for key in labelNodeCast
            } // if labelNode is undefined
          }

        }
      }

      this.self.saveConfig(this.self.config)
    }
  }
}
