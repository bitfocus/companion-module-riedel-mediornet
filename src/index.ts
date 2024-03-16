import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetActionsList } from './actions'
import { GetConfigFields, DeviceConfig } from './config'
import { GetFeedbacksList } from './feedback'
import { DeviceState } from './state'
import { initVariables } from './variables'
import { GetPresetsList } from './presets'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'

/**
 * Companion instance class for Riedels Mediornet Devices
 */
export class MediornetInstance extends InstanceBase<DeviceConfig> {
  public emberClient!: EmberClient
  config!: DeviceConfig
  private state!: DeviceState
  connectionInterval?: NodeJS.Timeout

  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   */
  public async init(config: DeviceConfig): Promise<void> {
    this.config = config
    this.state = new DeviceState(this)

    //this.state.updateOfflineMatrix(this.config)
    void this.setupEmberConnection()
  }

  /**
   * Process an updated configuration array.
   */
  public async configUpdated(config: DeviceConfig): Promise<void> {
    this.config = config

    await this.emberClient.disconnectAsync()

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
    await this.emberClient.disconnectAsync()
  }

  /**
   * Updates all Actions and Feedbacks.
   * Initializes all Variables.
   */
  public updateCompanionBits(): void {
    //this.state.updateOfflineMatrix(this.config)
    this.setActionDefinitions(GetActionsList(this, this.emberClient, this.config, this.state))
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.emberClient, this.state))
    this.setPresetDefinitions(GetPresetsList(this.state))
    initVariables(this, this.state)
  } // end updateCompanionBits

  /**
   * Set's up the connection to the Mediornet.
   * Changes the status of the module, depending on the connection's status.
   * On Connection state.subscribeMediornet() is called, to get all the relevant information.
   * Updates CompanionBits afterward.
   * @private
   */
  private async setupEmberConnection(): Promise<void> {

    this.emberClient = new EmberClient({ host: this.config.host || '', port: 9000, timeoutValue: 3000 })

    this.emberClient.on('error', async (e) => {
      this.updateStatus(InstanceStatus.ConnectionFailure)
      this.log('error', 'emberClient Error: ' + String(e))
      if (String(e).includes('EmberTimeoutError')) await this.emberClient.disconnectAsync()

      clearInterval(this.connectionInterval)

      setTimeout(() => {
        this.emberClient.connectAsync()
          .then()
          .catch((_e) => {
            this.updateStatus(InstanceStatus.ConnectionFailure)
          })
      }, 2000)

    })

    this.emberClient.on('connecting', () => {
      this.updateStatus(InstanceStatus.Connecting)
      this.log('debug', 'Connecting: ' + (this.config.host || '') + ':' + 9000)

    })

    this.emberClient.on('connected', async () => {
      this.updateStatus(InstanceStatus.Ok)
      this.log('debug', 'Connected: ' + (this.config.host || '') + ':' + 9000)
      Promise.resolve().then(async () => {
        await this.emberClient.getDirectoryAsync()
          .then(async () => {
            await this.state.subscribeDevice()
            this.updateCompanionBits()
          })
          .catch((e) => {
            this.log('error', 'Failed to discover root: ' + e)
          })

        this.connectionInterval = setInterval(async () => {

          await this.emberClient.getElementByPathAsync('1')
            .then()
            .catch(async (_e) => {
              await this.emberClient.disconnectAsync()
            })
        }, 3000)
      })
        .catch((error) => this.log('error', 'Promise not valid: ' + error))
    })

    this.emberClient.on('disconnected', (e) => {
      this.updateStatus(InstanceStatus.Disconnected)
      this.log('error', 'Disconnected Text: ' + e)
      this.log('error', 'Disconnected JSON: ' + JSON.stringify(e))
    })

    await this.emberClient.connectAsync()
      .then()
      .catch((e) => {
        this.updateStatus(InstanceStatus.ConnectionFailure)
        this.emberClient.emit('error', 'Error on Connecting: ' + e)
      })


  }
}

runEntrypoint(MediornetInstance, [])
