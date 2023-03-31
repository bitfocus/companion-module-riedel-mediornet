import { MediornetConfig } from './config'
import { MediornetInstance } from './index'
import { FieldFlags } from 'emberplus-connection/dist/model/Command'
import { EmberClient } from 'emberplus-connection'
import * as console from 'console'
import { NumberedTreeNodeImpl, ParameterImpl } from 'emberplus-connection/dist/model'
import { CompanionVariableValues } from '@companion-module/base'
import { FeedbackId } from './feedback'
import { RootElement } from 'emberplus-connection/dist/types'

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
  // lock: string // TODO - type better?
}

export interface OutputState {
  id: number
  index: number
  label: string
  name: string
  route: number
  active: boolean
  // lock: string // TODO - type better?
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
      { id: 0, label: 'video', path: videoPath },
      { id: 1, label: 'audio', path: audioPath },
      { id: 2, label: 'data', path: dataPath },
      { id: 3, label: 'multichannelaudio', path: multiChannelAudioPath },
      { id: 4, label: 'gpio', path: gpioPath },
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
      for (let id = this.inputs[i].length; id < inputCount[i]; id++) {
        this.inputs[i].push({
          id,
          label: `${id + 1}: Input ${id + 1}`,
          name: `Input ${id + 1}`,
          active: true,
          // lock: 'U',
        })
      }
    }
    for (let i = 0; i < this.matrices.length; i++) {
      this.outputs[i] = this.outputs[i].slice(0, outputCount[i])
      for (let id = this.outputs[i].length; id < outputCount[i]; id++) {
        this.outputs[i].push({
          id,
          index: id,
          label: `${id + 1}: Output ${id + 1}`,
          name: `Output ${id + 1}`,
          active: true,
          route: 1001,
          fallback: [],
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
    return this.inputs[matrix][id]
  }

  /**
   * INTERNAL: returns the desired output object.
   *
   * @param id - the output to fetch
   * @param matrix - number of wanted matrix
   * @returns the desired output object
   */
  public getOutputById(id: number, matrix: number): OutputState | undefined {
    return this.outputs[matrix][id]
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
    return this.inputs[matrix]
  }

  /**
   * Returns all Outputs of a specified matrix.
   * @param matrix the matrix which outputs are wanted
   */
  public iterateOutputs(matrix: number): OutputState[] {
    return this.outputs[matrix]
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
    //get labelParentNode
    const labelParentNode = await emberClient
      .getElementByPath(labelPath)
      .then(async (tempNode) => {
        if (tempNode != undefined) {
          // get Directory for labelParentNode and give callback function for updates
          return (await emberClient.getDirectory(tempNode, FieldFlags.All)).response
        } else return undefined
      })
      .catch((error) => console.log(labelPath + ': Node does not exist. There are no labels for matrix: ') + error)

    if (labelParentNode != undefined) {
      let inOutLabel: string
      let inOutList: OutputState[] | InputState[]
      if (labelParentNode.contents.identifier == 'targets') {
        inOutLabel = 'output'
        inOutList = this.outputs[matrix.id]
      } else if (labelParentNode.contents.identifier == 'sources') {
        inOutLabel = 'input'
        inOutList = this.inputs[matrix.id]
      } else return
      if (labelParentNode.children != undefined) {
        const variableValues: CompanionVariableValues = {}
        let i = 0
        for (const nodeKey of labelParentNode['children'] as any[]) {
          if (nodeKey != undefined && nodeKey['path']) {
            await emberClient
              .getElementByPath(nodeKey['path'])
              .then(async (newlableNode) => {
                if (newlableNode != undefined) {
                  await emberClient.subscribe(newlableNode, (update) => {
                    const castupdate = update as NumberedTreeNodeImpl<ParameterImpl>
                    const variableValues: CompanionVariableValues = {}
                    inOutList[castupdate.number].name = String(castupdate['contents']['value'])
                    inOutList[castupdate.number].label = `${castupdate.number + 1}: ${String(
                      castupdate['contents']['value']
                    )}`
                    variableValues[`${inOutLabel}_${matrix.label}_${inOutList[castupdate.number].id + 1}`] =
                      inOutList[castupdate.number].name
                    this.self.setVariableValues(variableValues)
                    this.self.updateCompanionBits()
                  })
                }
                const castLabelNode = newlableNode as NumberedTreeNodeImpl<ParameterImpl>
                inOutList[castLabelNode.number].name = String(castLabelNode['contents']['value'])
                inOutList[castLabelNode.number].label = `${castLabelNode.number + 1}: ${String(
                  castLabelNode['contents']['value']
                )}`
                variableValues[`${inOutLabel}_${matrix.label}_${inOutList[castLabelNode.number].id + 1}`] =
                  inOutList[castLabelNode.number].name
              })
              .catch((error) => console.log(error))
          } else {
            inOutList[i].active = false
          }
          i++
        }

        this.self.setVariableValues(variableValues)
        this.self.updateCompanionBits()
      } else {
        inOutList.forEach((value) => {
          value.active = false
        })
      }
    }
  }

  /**
   * Initially reads all wanted values from the Mediornet.
   * Callbacks are given for wanted updates.
   */
  public async subscribeMediornet(): Promise<void> {
    // MATRIX --------------
    if (this.self.emberClient.connected) {
      const updatedConfig: MediornetConfig = {
        inputCountString: '',
        outputCountString: '',
      }
      const inputs = this.self.config.inputCountString.split(',')
      const outputs = this.self.config.outputCountString.split(',')
      for (let i = 0; i < this.matrices.length; i++) {
        // for every matrix the module is subscribing to connections, labels and the corresponding updates
        const matrix = this.matrices[i]
        const matrixNode = await this.self.emberClient
          .getElementByPath(matrix.path)
          .then(async (node) => {
            return node
          })
          .catch((err) => this.self.log('error', matrix.path + ': Node does not exist. There is no matrix. ' + err))

        if (
          matrixNode != undefined &&
          'labels' in matrixNode.contents &&
          matrixNode['contents']['labels'] != undefined
        ) {
          const labelPath = matrixNode['contents']['labels'][0]['basePath']
          const labelNode = await this.self.emberClient
            .getElementByPath(labelPath)
            .then(async (node) => {
              if (node != undefined) return (await this.self.emberClient.getDirectory(node)).response
              else return undefined
            })
            .catch(() =>
              console.log(labelPath + ': Node does not exist. There are no labels for matrix: ' + matrix.path)
            )

          //Update counts of matrix, that it matches the needed number for the coming lables
          inputs[i] = matrixNode.contents.sourceCount != undefined ? String(matrixNode.contents.sourceCount) : '0'
          outputs[i] = matrixNode.contents.targetCount != undefined ? String(matrixNode.contents.targetCount) : '0'
          updatedConfig.inputCountString = this.self.config.inputCountString = inputs.join(',')
          updatedConfig.outputCountString = this.self.config.outputCountString = outputs.join(',')
          this.updateCounts(this.self.config)

          //Set callback for matrix to update internal matrix connection infos
          await this.self.emberClient.getDirectory(matrixNode, FieldFlags.All, (matrixUpdate) => {
            if ('connections' in matrixUpdate['contents'] && matrixUpdate['contents']['connections'] != undefined) {
              for (const key in matrixUpdate.contents.connections) {
                const sources = matrixUpdate.contents.connections[key].sources
                if (sources != undefined) {
                  if (this.outputs[matrix.id][key] != undefined) {
                    this.outputs[matrix.id][key].route = sources[0]
                    this.outputs[matrix.id][key].fallback.push(sources[0])
                    this.self.checkFeedbacks(
                      FeedbackId.TakeTallySourceVideo,
                      FeedbackId.TakeTallySourceAudio,
                      FeedbackId.TakeTallySourceData,
                      FeedbackId.TakeTallySourceMultiChannelAudio,
                      FeedbackId.TakeTallySourceGPIO,
                      FeedbackId.Undo
                    )
                  } //if state.output.. undefined
                } // if sources != undefined
              } //for key in matrix.connections
            } //if 'connections' in matrixUpdate
          }) // end getDirectory
          if (labelNode != undefined) {
            const labelNodeCast = labelNode as RootElement
            for (const key in labelNodeCast['children']) {
              const keyCast = Number(key)
              const node = labelNodeCast.children[keyCast]
              if ('identifier' in node.contents && 'path' in node && typeof node['path'] == 'string') {
                console.log('Got labels on ' + matrix.label + ' for ' + node.contents.identifier)
                if (node.contents.identifier == 'targets') {
                  await this.getLabels(node.path, matrix, this.self.emberClient)
                } else if (node.contents.identifier == 'sources') {
                  await this.getLabels(node.path, matrix, this.self.emberClient)
                } // else if
              } // if 'identifier in ...
            } // for key in labelNodeCast
          } // if labelNode is undefined
        } // if matrixNode is undefined
      } // for matrix in matrices
    } // if emberclient.connected
  }
}
