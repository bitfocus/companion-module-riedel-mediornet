import { MediornetConfig } from './config'
import { MediornetInstance } from './index'
import { QualifiedMatrix } from 'node-emberplus/lib/common/matrix/qualified-matrix'
import { QualifiedNode } from 'node-emberplus/lib/common/qualified-node'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'
import { QualifiedParameter } from 'node-emberplus/lib/common/qualified-parameter'

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
  path: string
  inputs: InputState[]
  outputs: OutputState[]
}

export interface CurrentSelected {
  target: number
  source: number
  matrix: number
}

export interface InputState {
  id: number
  label: string
  name: string
  active: boolean
  lock: boolean
}

export interface OutputState {
  id: number
  label: string
  name: string
  route: number
  active: boolean
  lock: boolean
  fallback: number[]
  //type: 'primary' | 'monitor'
}

export class MediornetState {
  self: MediornetInstance
  selected: CurrentSelected
  matrices: Matrix[]
  //queuedOp: QueueOperation | undefined

  inputs: InputState[][]
  outputs: OutputState[][]

  constructor(self: MediornetInstance) {
    this.self = self
    this.selected = {
      source: -1,
      target: -1,
      matrix: -1,
    }
    this.inputs = []
    this.outputs = []
    this.matrices = [
      { id: 0, label: 'video', path: videoPath, inputs: [], outputs: []  },
      { id: 1, label: 'audio', path: audioPath, inputs: [], outputs: []  },
      { id: 2, label: 'data', path: dataPath, inputs: [], outputs: []  },
      { id: 3, label: 'multichannelaudio', path: multiChannelAudioPath, inputs: [], outputs: []  },
      { id: 4, label: 'gpio', path: gpioPath, inputs: [], outputs: []  },
    ]

    for (let i = 0; i < this.matrices.length; i++) {
      this.inputs[i] = []
      this.outputs[i] = []
    }
  }

  public updateCounts(config: MediornetConfig): void {
    const inputCount = config.inputCountString.split(',').map(Number)
    const outputCount = config.outputCountString.split(',').map(Number)

    for (let i = 0; i < this.matrices.length; i++) {
      for (let id = this.matrices[i].inputs.length; id < inputCount[i]; id++) {
        this.matrices[i].inputs.push({
          id: id,
          label: `Input ${id}`,
          name: `Input ${id}`,
          active: true,
          lock: false,
        })
      }
    }
    for (let i = 0; i < this.matrices.length; i++) {
      this.matrices[i].outputs = this.matrices[i].outputs.slice(0, outputCount[i])
      for (let id = this.matrices[i].outputs.length; id < outputCount[i]; id++) {
        this.matrices[i].outputs.push({
          id: id,
          label: `Output ${id}`,
          name: `Output ${id}`,
          active: true,
          route: 0,
          fallback: [],
          lock: false,
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
    return this.matrices[matrix].inputs[id]
  }

  /**
   * INTERNAL: returns the desired output object.
   *
   * @param id - the output to fetch
   * @param matrix - number of wanted matrix
   * @returns the desired output object
   */
  public getOutputById(id: number, matrix: number): OutputState | undefined {
    return this.matrices[matrix].outputs[id]
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
  public iterateInputs(matrix: number): InputState[] {
    return this.matrices[matrix].inputs
  }

  /**
   * Returns all Outputs of a specified matrix.
   * @param matrix the matrix which outputs are wanted
   */
  public iterateOutputs(matrix: number): OutputState[] {
    return this.matrices[matrix].outputs
  }

  /**
   * This function expects a path to possible labels for a specified matrix
   * It checks, wether the path is valid, and writes all recieved labels into the inputs and outputs.
   * For coming updates, each labelPath is subscribed with a callback function.
   * @param labelPath path to potential Labels
   * @param matrix matrix for which the labels are used
   * @param emberClient reference to the emberClient
   */
  async getLabels(labelPath: string, matrix: Matrix, emberClient: EmberClient): Promise<void> {
    //this.self.log('debug', labelPath + matrix + emberClient)
    //get labelParentNode

    let labelNode = await emberClient
      .getElementByPathAsync(labelPath)
      .then((tempNode) => {
        return tempNode
      })
      .catch((error) => {
        this.self.log('error', labelPath + ': Node does not exist. There are no labels for matrix: ' + error)
        return null
      })

    let labelTarget: InputState[] | OutputState[]
    //let labelTargetGroup: string
    if (labelNode?.identifier == 'targets') {
      labelTarget = matrix.outputs
      //labelTargetGroup = 'Output'
    } else {
      labelTarget = matrix.inputs
      //labelTargetGroup = 'Input'
    }

    //const variableValues: CompanionVariableValues = {}
    let i = 0
    labelNode?.elements.forEach((object, key) => {
      if (object instanceof QualifiedParameter && key != undefined) {
        key = key as number
        labelTarget[i].id = key
        if (typeof object.identifier == 'string' && typeof object.value == 'string') {
          labelTarget[i].name = object.identifier
          labelTarget[i].label = object.value
        }
        /*
          variableValues[`${labelTargetGroup}_${matrix.label}_${labelTarget[i].id}`] =
            labelTarget[i].label
           */
        emberClient.getElementByPathAsync(object.path, (update) => {
          if (update instanceof QualifiedParameter) {
            labelTarget[update.path.split('.').pop() as unknown as number].label = update.value as string
            /*const variableValuesnew: CompanionVariableValues = {}
              variableValuesnew[`${labelTargetGroup}_${matrix.label}_${labelTarget[i].id}`] =
                labelTarget[i].label
              this.self.setVariableValues(variableValuesnew)
               */
            this.self.updateCompanionBits() //TODO: use setVariableValues due to cost
          }
        })
      }
      i++
    })
    //this.self.setVariableValues(variableValues)
    this.self.updateCompanionBits() //TODO: use setVariableValues due to cost
  }

  /**
   * Initially reads all wanted values from the Mediornet.
   * Callbacks are given for wanted updates.
   */
  public async subscribeMediornet(): Promise<void> {
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
          inputs[i] = matrixNode.sourceCount != undefined ? String(matrixNode.contents.sourceCount) : '0'
          outputs[i] = matrixNode.targetCount != undefined ? String(matrixNode.contents.targetCount) : '0'
          this.self.config.inputCountString = inputs.join(',')
          this.self.config.outputCountString = outputs.join(',')
          this.self.saveConfig(this.self.config)

          //Set callback for matrix to update internal matrix connection infos
          await this.self.emberClient.getDirectoryAsync(matrixNode, (matrixUpdate) => {
            if (matrixUpdate instanceof QualifiedMatrix && matrixUpdate.connections != null) {
              for (const key in matrixUpdate.connections) {
                const sources = matrixUpdate.connections[key].sources
                if (sources != undefined) {
                  if (this.matrices[matrix.id].outputs[key] != undefined) {
                    this.matrices[matrix.id].outputs[key].route = sources[0]
                    this.matrices[matrix.id].outputs[key].fallback.push(sources[0])
                    /*this.self.checkFeedbacks(
                      FeedbackId.TakeTallySourceVideo,
                      FeedbackId.TakeTallySourceAudio,
                      FeedbackId.TakeTallySourceVideoQuad,
                      FeedbackId.TakeTallySourceAudioQuad,
                      FeedbackId.Undo
                    )
                     */
                  } //if state.output.. undefined
                } // if sources != undefined
              } //for key in matrix.connections
            } //if 'connections' in matrixUpdate
          }) // end getDirectory

          //Recieve Labels
          if (matrixNode.labels != null) {
            const labelPath = matrixNode.labels[0].basePath
            const labelNode = await this.self.emberClient
              .getElementByPathAsync(labelPath)
              .then(async (node) => {
                if (node != undefined) return await this.self.emberClient.getDirectoryAsync(node)
                else return undefined
              })
              .catch(() =>
                console.log(labelPath + ': Node does not exist. There are no labels for matrix: ' + matrix.path)
              )
            if (labelNode?.hasChildren()) {
              labelNode?.elements.forEach((child) => {
                if (child instanceof QualifiedNode) {
                  //this.self.log('debug', JSON.stringify(child))
                  this.getLabels(child.path, matrix, this.self.emberClient)
                }
              })
            } // for key in labelNodeCast
          } // if labelNode is undefined
        }
      }
    }
  }
}
