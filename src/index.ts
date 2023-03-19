import {
  InstanceBase,
  InstanceStatus,
  runEntrypoint,
  SomeCompanionConfigField
} from '@companion-module/base'
import {GetActionsList} from './actions'
import {GetConfigFields, MediornetConfig} from './config'
import {FeedbackId, GetFeedbacksList} from './feedback'
import {EmberClient} from 'emberplus-connection' // note - emberplus-conn is in parent repo, not sure if it needs to be defined as dependency
import {Matrix, MediornetState} from "./state";
import {initVariables} from "./variables";
import console from "console";
import {FieldFlags} from "emberplus-connection/dist/model/Command";
import {RootElement} from "emberplus-connection/dist/types";

/**
 * Companion instance class for Riedels Mediornet Devices
 */
export class MediornetInstance extends InstanceBase<MediornetConfig> {
  public emberClient!: EmberClient
  private config!: MediornetConfig
  private state!: MediornetState


  // Override base types to make types stricter
  public checkFeedbacks(...feedbackTypes: string[]): void {
    // todo - arg should be of type FeedbackId
    super.checkFeedbacks(...feedbackTypes)
  }

  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   */
  public async init(config: MediornetConfig): Promise<void> {
    this.config = config
    this.state = new MediornetState(this)

    this.state.updateCounts(this.config)
    await this.setupEmberConnection()

  }

  /**
   * Process an updated configuration array.
   */
  public async configUpdated(config: MediornetConfig): Promise<void> {
    this.config = config

    this.emberClient.discard()
    this.emberClient.removeAllListeners()

    await this.setupEmberConnection()
  }

  /**
   * Creates the configuration fields for web config.
   */
  public getConfigFields(): SomeCompanionConfigField[] {
    return GetConfigFields()
  }

  /**
   * Clean up the instance before it is destroyed.
   */
  public async destroy(): Promise<void> {
    this.emberClient.discard()
  }

  public updateCompanionBits(): void {
    this.setActionDefinitions(GetActionsList(this, this.client, this.config, this.state))
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.client, this.state))
    initVariables(this, this.state);

  }// end updateCompanionBits

  private async subscribeMediornet(): Promise<void>{
    if (this.emberClient.connected) {
      let updatedConfig: MediornetConfig = {
        inputCountString: '',
        outputCountString: '',
      }
      let inputs = this.config.inputCountString.split(',')
      let outputs = this.config.outputCountString.split(',')
      for (let i = 0; i < this.state.matrices.length; i++) {
        const matrix = this.state.matrices[i]
        //this.subscribeMatrix(this.state.matrices[i]).then(r => this.log('debug', r))
        const matrixNode = await this.emberClient.getElementByPath(matrix.path).then(async (node) => {
          return node
        }).catch((err) => this.log('error', matrix.path + ": Node does not exist. There is no matrix. " + err))

        if (matrixNode != undefined && 'labels' in matrixNode.contents && matrixNode['contents']['labels'] != undefined) {
          const labelPath = matrixNode['contents']['labels'][0]['basePath']
          const labelNode = await this.emberClient.getElementByPath(labelPath).then(async (node) => {
            if (node != undefined) return (await this.emberClient.getDirectory(node)).response
            else return undefined
          }).catch(() => console.log(labelPath + ": Node does not exist. There are no labels for matrix: " + matrix.path))

          //Update counts of matrix, that it matches the needed number for the coming lables
          inputs[i] = matrixNode.contents.sourceCount != undefined ? String(matrixNode.contents.sourceCount) : '0'
          outputs[i] = matrixNode.contents.targetCount != undefined ? String(matrixNode.contents.targetCount) : '0'
          updatedConfig.inputCountString = inputs.join(',')
          updatedConfig.outputCountString = outputs.join(',')
          this.state.updateCounts(updatedConfig)

          //Set callback for matrix to update internal matrix connection infos
          await this.emberClient.getDirectory(matrixNode, FieldFlags.All, (matrixUpdate) => {
            if ('connections' in matrixUpdate['contents'] && matrixUpdate['contents']['connections'] != undefined) {
              for (const key in matrixUpdate.contents.connections) {
                const sources = matrixUpdate.contents.connections[key].sources
                if (sources != undefined) {
                  if (this.state.outputs[matrix.id][key] != undefined) {
                    this.state.outputs[matrix.id][key].route = sources[0]
                    this.state.outputs[matrix.id][key].fallback.push(sources[0])
                    this.checkFeedbacks(FeedbackId.SourceBackgroundRoutedVideo)
                  } //if state.output.. undefined
                }// if sources != undefined
              } //for key in matrix.connections
            } //if 'connections' in matrixUpdate
          })// end getDirectory
          if (labelNode != undefined) {

            const labelNodeCast = labelNode as RootElement
            for (const key in labelNodeCast['children']) {
              const keyCast = Number(key)
              const node = labelNodeCast.children[keyCast]
              if ('identifier' in node.contents && 'path' in node && typeof node['path'] == "string") {
                console.log( 'Got labels on ' + matrix.label + ' for ' + node.contents.identifier)
                if (node.contents.identifier == "targets") {
                  await this.state.getLabels(node.path, matrix, this.emberClient)
                } else if (node.contents.identifier == "sources") {
                  await this.state.getLabels(node.path, matrix, this.emberClient)
                } // else if
              } // if 'identifier in ...
            } // for key in labelNodeCast
          } // if labelNode is undefined
        } // if matrixNode is undefined
      } // for matrix in matrices
    }// if emberclient.connected
  }

  private get client(): EmberClient {
    return this.emberClient
  }

  private async setupEmberConnection(): Promise<void> {
    this.log('debug', 'connecting ' + (this.config.host || '') + ':' + 9000)
    this.updateStatus(InstanceStatus.Connecting)

    this.emberClient = new EmberClient(this.config.host || '', 9000, 10000)
    this.emberClient.on('error', (e) => {
      this.log('error', 'Error ' + e)
    })
    this.emberClient.on('connected', () => {
      Promise.resolve()
        .then(async () => {
          const request = await this.emberClient.getDirectory(this.emberClient.tree)
          await request.response
          await this.subscribeMediornet()
          this.updateCompanionBits()
        })
        .catch((e) => {
          // get root
          this.log('error', 'Failed to discover root: ' + e)
        })
      this.updateStatus(InstanceStatus.Ok)
    })
    this.emberClient.on('disconnected', () => {
      this.updateStatus(InstanceStatus.Connecting)
    })
    await this.emberClient.connect().catch((e) => {
      this.updateStatus(InstanceStatus.ConnectionFailure)
      this.log('error', 'Error ' + e)
    })
    //await this.subscribeMediornet()
    this.updateCompanionBits()
  }


  public async subscribeMatrix(matrix: Matrix): Promise<any> {
    this.log('debug', 'entered subscribeMatrix. ' + matrix.label + ' on ' + matrix.path)
    //get node
    console.log(await this.emberClient.getElementByPath(matrix.path))
    /*
    const node = await this.emberClient.getElementByPath(matrix.path).then(async (node) => {
      // get Directory for node and give callback function for updates
      if (node != undefined) {
        await this.emberClient.getDirectory(node, FieldFlags.All, (update) => {
          // update local matrix on update
          if ('connections' in update['contents'] && update['contents']['connections'] != undefined) {
            for (const key in update.contents.connections) {
              const sources = update.contents.connections[key].sources
              if (sources != undefined) {
                this.state.outputs[matrix.id][key].route = sources[0]
                this.state.outputs[matrix.id][key].fallback.push(sources[0])
              }
            }
          }
        })
        this.log('debug', 'inside if')
      }
    }).catch((err) => this.log('error', matrix.path + ": Node does not exist. There is no matrix. " + err))

    if (node != undefined) {
      const labelPath = node['contents']['labels'][0]['basePath']

      const labelNode = await this.emberClient.getElementByPath(labelPath).then(async (node) => {
        if (node != undefined) return (await this.emberClient.getDirectory(node)).response
        else return undefined
      }).catch(() => console.log(labelPath + ": Node does not exist. There are no labels for matrix: " + matrix.path))

      if (labelNode != undefined) {
        const labelNodeCast = labelNode as RootElement
        for (const key in labelNodeCast['children']) {
          const keyCast = Number(key)
          const node = labelNodeCast.children[keyCast]
          if ('identifier' in node.contents && 'path' in node && typeof node['path'] == "string") {
            if (node.contents.identifier == "targets") {
              this.log('debug', "TARGETSSSS")
              await this.state.getLabels(node['path'], matrix, this.emberClient)
            } else if (node.contents.identifier == "sources") {
              this.log('debug', "SOURCESSS")
              await this.state.getLabels(node.path, matrix, this.emberClient)
            }
          }
        }
      }
    }
    return 'tried to subscribe to matrix ' + matrix.label

     */
  }
}

runEntrypoint(MediornetInstance, [])
