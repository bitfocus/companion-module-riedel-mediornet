import {MediornetConfig} from './config'
import {MediornetInstance} from './index'
import {FieldFlags} from "emberplus-connection/dist/model/Command";
import {EmberClient} from "emberplus-connection";
import * as console from "console";
import {NumberedTreeNodeImpl, ParameterImpl} from "emberplus-connection/dist/model";
import {CompanionVariableValues} from "@companion-module/base";

export enum matrixnames {
  video,
  audio,
  data,
  multichannelaudio,
  gpio
}

const videoPath = "1.2.0.3"
const audioPath = "1.2.1.3"
const dataPath = '1.2.2.3'
const multiChannelAudioPath = '1.2.3.3'
const gpioPath = '1.2.4.3'

export interface Matrix {
  id: number,
  label: string,
  path: string,
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
  selectedSource: number[]
  selectedDestination: number[]
  selectedMatrix: number
  matrices: Matrix[]
  //queuedOp: QueueOperation | undefined

  inputs: InputState[][]
  outputs: OutputState[][]


  constructor(self: MediornetInstance) {
    this.self = self
    this.inputs = []
    this.outputs = []
    this.matrices = [
      {id: 0, label: 'video', path: videoPath},
      {id: 1, label: 'audio', path: audioPath},
      {id: 2, label: 'data', path: dataPath},
      {id: 3, label: 'multichannelaudio', path: multiChannelAudioPath},
      {id: 4, label: 'gpio', path: gpioPath},
    ]

    for (let i = 0; i < this.matrices.length; i++) {
      this.inputs[i] = []
      this.outputs[i] = []
    }
    this.selectedMatrix = -1
    this.selectedDestination = [-1, -1, -1, -1, -1]
    this.selectedSource = [-1, -1, -1, -1, -1]


    this.updateCounts({inputCountString: '1005,1005,1005,1005,1005', outputCountString: '0,0,0,0,0'})
  }

  public updateCounts(config: MediornetConfig): void {
    const inputCount = config.inputCountString.split(',').map(Number)
    const outputCount = config.outputCountString.split(',').map(Number)

    for (let i = 0; i < this.matrices.length; i++) {
      //console.log(this.inputs[i].slice(0, inputCount[i]))
      this.inputs[i] = this.inputs[i].slice(0, inputCount[i])
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
      //this.outputs[i] = this.outputs[i].slice(0, outputCount[i])
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

  public getPrimaryOutput(id: number, type: number): OutputState | undefined {
    return this.outputs[type][id]
  }

  public getSelectedOutput(matrix: number): OutputState | undefined {
    return this.selectedDestination !== undefined ? this.getOutputById(this.selectedDestination[matrix], matrix) : undefined
  }

  public iterateInputs(matrix: number): InputState[] {
    return this.inputs[matrix]
  }

  public iterateOutputs(matrix: number): OutputState[] {
    return this.outputs[matrix]
  }

  async getLabels(labelPath: string, matrix: Matrix,
                  emberClient: EmberClient): Promise<void> {
    //get labelParentNode
    const labelParentNode = await emberClient.getElementByPath(labelPath).then(async (tempNode) => {
      if (tempNode != undefined) {
        // get Directory for labelParentNode and give callback function for updates
        return (await emberClient.getDirectory(tempNode, FieldFlags.All)).response
      } else return undefined
    }).catch((error) => console.log(labelPath + ": Node does not exist. There are no labels for matrix: ") + error)

    if (labelParentNode != undefined) {
      if (labelParentNode.children != undefined) {
        let inOutLabel: string
        let inOutList: OutputState[] | InputState[]
        if (labelParentNode.contents.identifier == 'targets') {
          inOutLabel = 'output'
          inOutList = this.outputs[matrix.id]
        } else if (labelParentNode.contents.identifier == 'sources') {
          inOutLabel = 'input'
          inOutList = this.inputs[matrix.id]
        } else return
        const variableValues: CompanionVariableValues = {}
        let i = 0
        for (const nodeKey of labelParentNode['children'] as any[]) {
          if (nodeKey != undefined && nodeKey['path']) {
            await emberClient.getElementByPath(nodeKey['path']).then(async (newlableNode) => {
                if (newlableNode != undefined) {
                  await emberClient.subscribe(newlableNode, (update) => {
                    const castupdate = update as NumberedTreeNodeImpl<ParameterImpl>
                    const variableValues: CompanionVariableValues = {}
                    inOutList[castupdate.number].name = String(castupdate['contents']['value'])
                    inOutList[castupdate.number].label = `${castupdate.number + 1}: ${String(castupdate['contents']['value'])}`
                    variableValues[`${inOutLabel}_${matrix.label}_${inOutList[castupdate.number].id + 1}`] = inOutList[castupdate.number].name
                    this.self.setVariableValues(variableValues)
                    this.self.updateCompanionBits()
                  })
                }
                const castLabelNode = newlableNode as NumberedTreeNodeImpl<ParameterImpl>
                inOutList[castLabelNode.number].name = String(castLabelNode['contents']['value'])
                inOutList[castLabelNode.number].label = `${castLabelNode.number + 1}: ${String(castLabelNode['contents']['value'])}`
                variableValues[`${inOutLabel}_${matrix.label}_${inOutList[castLabelNode.number].id + 1}`] = inOutList[castLabelNode.number].name
              }
            ).catch((error) => console.log(error))
          } else {
            inOutList[i].active = false
          }
          i++
        }
        this.self.setVariableValues(variableValues)
        this.self.updateCompanionBits()
        console.log(inOutList)
      }
    }
  }

  /*

    public async subscribeMatrix(matrix: Matrix, emberClient: EmberClient): Promise<any> {
      this.self.log('debug', 'entered subscribeMatrix. ' + matrix.label + ' on ' + matrix.path)
      //get node
      console.log(await emberClient.getElementByPath(matrix.path))
      const node = await emberClient.getElementByPath(matrix.path).then(async (node) => {
        // get Directory for node and give callback function for updates
        if (node != undefined) {
          await emberClient.getDirectory(node, FieldFlags.All, (update) => {
            // update local matrix on update
            if ('connections' in update['contents'] && update['contents']['connections'] != undefined) {
              for (const key in update.contents.connections) {
                const sources = update.contents.connections[key].sources
                if (sources != undefined) {
                  this.outputs[matrix.id][key].route = sources[0]
                  this.outputs[matrix.id][key].fallback.push(sources[0])
                }
              }
            }
          })
          this.self.log('debug', 'inside if')
        }
      }).catch((err) => this.self.log('error', matrix.path + ": Node does not exist. There is no matrix. " + err))

      if (node != undefined) {
        const labelPath = node['contents']['labels'][0]['basePath']

        const labelNode = await emberClient.getElementByPath(labelPath).then(async (node) => {
          if (node != undefined) return (await emberClient.getDirectory(node)).response
          else return undefined
        }).catch(() => console.log(labelPath + ": Node does not exist. There are no labels for matrix: " + matrix.path))

        if (labelNode != undefined) {
          const labelNodeCast = labelNode as RootElement
          for (const key in labelNodeCast['children']) {
            const keyCast = Number(key)
            const node = labelNodeCast.children[keyCast]
            if ('identifier' in node.contents && 'path' in node && typeof node['path'] == "string") {
              if (node.contents.identifier == "targets") {
                this.self.log('debug', "TARGETSSSS")
                await this.getLabels(node['path'], matrix, emberClient)
              } else if (node.contents.identifier == "sources") {
                this.self.log('debug', "SOURCESSS")
                await this.getLabels(node.path, matrix, emberClient)
              }
            }
          }
        }
      }
      return 'tried to subscribe to matrix ' + matrix.label
    }

   */
}