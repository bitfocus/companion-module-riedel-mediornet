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
   * Changes the status of the module, depeding of the connection's status.
   * On Connection state.subscribeMediornet() is called, to get all the relevent information.
   * Updates CompanionBits afterwards.
   * @private
   */
  private async setupEmberConnection(): Promise<void> {
    this.log('debug', 'connecting ' + (this.config.host || '') + ':' + 9000)
    this.updateStatus(InstanceStatus.Connecting)

    this.emberClient = new EmberClient({ host: this.config.host || '', port: 9000 })
    this.emberClient.on('error', (e: string) => {
      this.log('error', 'Error ' + e)
    })
    this.emberClient.on('connected', () => {
      Promise.resolve()
        .then(async () => {
          this.log('debug', 'connected to ' + (this.config.host || '') + ':' + 9000)
          await this.state.subscribeDevice()
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
    await this.emberClient.connectAsync().then(async () => {
      await this.emberClient.getDirectoryAsync()
    } ).catch((e) => {
      this.updateStatus(InstanceStatus.ConnectionFailure)
      this.log('error', e)
    })
    this.updateCompanionBits()
  }
}

runEntrypoint(MediornetInstance, [])
