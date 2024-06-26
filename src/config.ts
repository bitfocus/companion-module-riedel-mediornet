import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface DeviceConfig {
  host?: string
  take?: boolean
  take_reset?: boolean
  inputCountString: string
  outputCountString: string
}

/**
 * Returns all configFields for the Webconfig.
 * @constructor
 */
export function GetConfigFields(): SomeCompanionConfigField[] {
  return [
    {
      type: 'textinput',
      id: 'host',
      label: 'Target IP',
      tooltip: 'The IP of the ember+ provider',
      width: 3,
      regex: Regex.IP,
    },
    {
      type: 'checkbox',
      id: 'take',
      label: 'Auto Take',
      tooltip: 'Immediately route source to target after selection process. No need for Take Action.',
      width: 3,
      default: false,
    },
    {
      type: 'checkbox',
      id: 'take_reset',
      label: 'Reset Selection',
      tooltip: 'Reset Source and Target after Take',
      width: 3,
      default: false,
    },
    {
      type: 'textinput',
      id: 'inputCountString',
      label: 'Number of Inputs',
      tooltip: 'Used, when there is no connection. Seperated by comma.',
      width: 6,
      default: '1005,1005,1005,1005,1005',
      required: true,
    },
    {
      type: 'textinput',
      id: 'outputCountString',
      label: 'Number of Outputs',
      tooltip: 'Used, when there is no connection. Seperated by comma.',
      width: 6,
      default: '0,0,0,0,0',
      required: true,
    },
  ]
}
