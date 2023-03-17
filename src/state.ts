import {MediornetConfig} from './config'
import {FieldFlags} from "emberplus-connection/dist/model/Command";
import {EmberClient} from "emberplus-connection";
import {RootElement} from 'emberplus-connection/dist/types';
import * as console from "console";
import {NumberedTreeNodeImpl, ParameterImpl, QualifiedElementImpl} from "emberplus-connection/dist/model";
import {InstanceBase} from "@companion-module/base";

export enum matrixnames {
  video,
  audio,
  data,
  multichannelaudio,
  gpio
}

const videoPath = '1.2.0.3'
const audioPath = '1.2.1.3'
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
  //status: string // TODO - type better?
  // lock: string // TODO - type better?
}

export interface OutputState {
  id: number
  index: number
  label: string
  name: string
  route: number
  //status: string // TODO - type better?
  // lock: string // TODO - type better?
  fallback: number[]
  //type: 'primary' | 'monitor'
}

export class MediornetState {
  self: InstanceBase<MediornetConfig>
  selectedSource: number[]
  selectedDestination: number[]
  matrices: Matrix[]
  //queuedOp: QueueOperation | undefined

  #inputs: InputState[][]
  #outputs: OutputState[][]


  constructor(self: InstanceBase<MediornetConfig>) {
    this.self = self
    this.#inputs = []
    this.#outputs = []
    this.matrices = [
      {id: 0, label: 'video', path: videoPath},
      {id: 1, label: 'audio', path: audioPath},
      {id: 2, label: 'data', path: dataPath},
      {id: 3, label: 'multichannelaudio', path: multiChannelAudioPath},
      {id: 4, label: 'gpio', path: gpioPath},
    ]

    for (let i = 0; i < this.matrices.length; i++) {
      this.#inputs[i] = []
      this.#outputs[i] = []
    }
    this.selectedDestination = [-1, -1, -1, -1, -1]
    this.selectedSource = [-1, -1, -1, -1, -1]


    this.updateCounts({inputCountString: '1005,1005,1005,1005,1005', outputCountString: '0,0,0,0,0'})
  }

  public updateCounts(config: MediornetConfig): void {
    const inputCount = config.inputCountString.split(',').map(Number)
    const outputCount = config.outputCountString.split(',').map(Number)

    for (let i = 0; i < this.matrices.length; i++) {
      this.#inputs[i] = this.#inputs[i].slice(0, inputCount[i])
      for (let id = this.#inputs[i].length; id < inputCount[i]; id++) {
        this.#inputs[i].push({
          id,
          label: `${id + 1}: Input ${id + 1}`,
          name: `Input ${id + 1}`,
          //status: 'BNC',
          // lock: 'U',
        })
      }
    }
    for (let i = 0; i < this.matrices.length; i++) {
      this.#outputs[i] = this.#outputs[i].slice(0, outputCount[i])
      for (let id = this.#outputs[i].length; id < outputCount[i]; id++) {
        this.#outputs[i].push({
          id,
          index: id,
          label: `${id + 1}: Output ${id + 1}`,
          name: `Output ${id + 1}`,
          route: id,
          fallback: [],
        })
      }
    }
  }

  public get allOutputsCount(): number {
    return this.#outputs.length
  }

  /**
   * INTERNAL: returns the desired input object.
   *
   * @param id - the input to fetch
   * @param matrix - number of wanted matrix
   * @returns the desired input object
   */
  public getInput(id: number, matrix: number): InputState | undefined {
    return this.#inputs[matrix][id]
  }

  /**
   * INTERNAL: returns the desired output object.
   *
   * @param id - the output to fetch
   * @param matrix - number of wanted matrix
   * @returns the desired output object
   */
  public getOutputById(id: number, matrix: number): OutputState | undefined {
    return this.#outputs[matrix][id]
  }

  public getPrimaryOutput(id: number, type: number): OutputState | undefined {
    return this.#outputs[type][id]
  }

  public getSelectedOutput(matrix: number): OutputState | undefined {
    return this.selectedDestination !== undefined ? this.getOutputById(this.selectedDestination[matrix], matrix) : undefined
  }

  public iterateInputs(matrix: number): InputState[] {
    return this.#inputs[matrix]
  }

  public iterateOutputs(matrix: number): OutputState[] {
    return this.#outputs[matrix]
  }

  private async getLabels(labelPath: string, _matrix: Matrix,
                          emberClient: EmberClient): Promise<void> {
    //get node
    const node = await emberClient.getElementByPath(labelPath).then(async (node) => {
      if (node != undefined) {
        // get Directory for node and give callback function for updates
        return (await emberClient.getDirectory(node, FieldFlags.All)).response
      } else return undefined
    }).catch(() => console.log(labelPath + ": Node does not exist. There are no labels for matrix: "))

    if (node != undefined && node instanceof QualifiedElementImpl) {
      if (node.children != undefined) {
        for (const nodeKey of node['children'] as any[]) {
          if (nodeKey != undefined && nodeKey['path']) {
            await emberClient.getElementByPath(nodeKey['path']).then(async (lableNode) => {
              if (lableNode != undefined) {
                await emberClient.subscribe(lableNode, (update) => {
                  const castupdate = update as NumberedTreeNodeImpl<ParameterImpl>
                  this.self.log('debug', String({id: castupdate['number'], label: castupdate['contents']['value']}))
                })
              }
              const castLableNode = lableNode as NumberedTreeNodeImpl<ParameterImpl>
              this.self.log('debug', String({id: castLableNode.number, label: castLableNode.contents.value}))
            }).catch((error) => console.log(error))
          }
        }
      }

    }
  }


  public async subscribeMatrix(matrix: Matrix,
                               emberClient: EmberClient): Promise<string> {
    this.self.log('debug', 'entered subscribeMatrix. ' + matrix.label + ' on ' + matrix.path)
    //get node
    const node = await emberClient.getElementByPath(matrix.path).then(async (node) => {
      // get Directory for node and give callback function for updates
      if (node != undefined) {
        await emberClient.getDirectory(node, FieldFlags.All, (update) => {
          // update local matrix on update
          if ('connections' in update['contents'] && update['contents']['connections'] != undefined) {
            for (const key in update.contents.connections) {
              const sources = update.contents.connections[key].sources
              if (sources != undefined) {
                this.#outputs[matrix.id][key].route = sources[0]
                this.#outputs[matrix.id][key].fallback.push(sources[0])
              }
            }
          }
        })
        this.self.log('debug', 'inside if')
      }
    }).catch((err) => this.self.log('error', matrix.path + ": Node does not exist. There is no matrix. " + err ))

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
}