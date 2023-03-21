import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface MediornetConfig {
  host?: string
  take?: boolean
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
      width: 6,
      regex: Regex.IP,
    },
    {
      type: 'checkbox',
      id: 'take',
      label: 'Enable Take? (XY only)',
      width: 6,
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
