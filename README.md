
# companion-module-riedel-mediornet
This Module establishes an connection with Mediornet Devices from Riedel such es (Mediornet Compact, Modular or microN).
You must have EmBER+ enabled in the 3rd Party Interfaces. Later select the IP-Address of the master device.
For further information download the 3rd Party Interfaces manual from the Riedel website (restricted access for users).

This Plugin supports Mediorworks Verision 7.3.1.
Version 7.4.0 does not work properly yet with this module.
## Getting started

Execute `yarn` command to install the dependencies.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn build:watch` the compiler will be run in watch mode to recompile the files on change.

## Using
### Config
Please enter:
- IP-Address
- Auto-Take
- InputCount
- OutputCount

EmBER+ Port is 9000 by specification from Riedel.

#### IP-Address
Enter the IP Address of the main Mediornet Device

#### Auto-Take
When enabled, a source is routed to the selected destination immediatly.

#### Input-/OutputCount
For offline Programming, you can give a wanted amount of in-/outputs to give you access to all variables and dropdown menues.
This value is internally overwritten, when a connection is established.

## To-Dos or further development
- [ ] Implement FSY activation
- [ ] Implement Colorbar activation
- [ ] make Feedback- and Actionlist shorter and add matrix in those fields instead (needs companion support)
- [ ] enable interaction with Mediornet Timers
- [ ] lock state of destinations
