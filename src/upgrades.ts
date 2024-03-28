import { CompanionStaticUpgradeResult, CompanionStaticUpgradeScript } from '@companion-module/base'
import { DeviceConfig } from './config'
import { matrixnames } from './state'


const upgradeV1_2_0: CompanionStaticUpgradeScript<DeviceConfig> = (_context, props): CompanionStaticUpgradeResult<DeviceConfig> => {
  let config: any = props.config
  let actions: any = props.actions
  let feedbacks: any = props.feedbacks

  const changes: CompanionStaticUpgradeResult<DeviceConfig> = {
    updatedConfig: config,
    updatedActions: [],
    updatedFeedbacks: []
  }

  // Actions
  actions.map((action: any) => {
    if (action.options.target === 'next' || action.options.target === 'previous') {
      action.options.next_previous_action = true
      action.options.next_previous = action.options.target
      delete action.options.target
    } else if (action.options.source === 'next' || action.options.source === 'previous') {
      action.options.next_previous_action = true
      action.options.next_previous = action.options.source
      delete action.options.source
    } else {
      action.options.next_previous_action = false
    }

    if (action.actionId === 'select_target_video') {
      action.actionId = 'select_target'
      action.options.matrix = matrixnames.video
      action.options.target_0 = action.options.target
      delete action.options.target
    } else if (action.actionId === 'select_target_audio') {
      action.actionId = 'select_target'
      action.options.matrix = matrixnames.audio
      action.options.target_1 = action.options.target
      delete action.options.target
    } else if (action.actionId === 'select_target_data') {
      action.actionId = 'select_target'
      action.options.matrix = matrixnames.data
      action.options.target_2 = action.options.target
      delete action.options.target
    } else if (action.actionId === 'select_target_multichannelaudio') {
      action.actionId = 'select_target'
      action.options.matrix = matrixnames.multichannelaudio
      action.options.target_3 = action.options.target
      delete action.options.target
    } else if (action.actionId === 'select_target_gpio') {
      action.actionId = 'select_target'
      action.options.matrix = matrixnames.gpio
      action.options.target_4 = action.options.target
      delete action.options.target
    } else if (action.actionId === 'select_source_video') {
      action.actionId = 'select_source'
      action.options.matrix = matrixnames.video
      action.options.source_0 = action.options.source
      delete action.options.source
    } else if (action.actionId === 'select_source_audio') {
      action.actionId = 'select_source'
      action.options.matrix = matrixnames.audio
      action.options.source_1 = action.options.source
      delete action.options.source
    } else if (action.actionId === 'select_source_data') {
      action.actionId = 'select_source'
      action.options.matrix = matrixnames.data
      action.options.source_2 = action.options.source
      delete action.options.source
    } else if (action.actionId === 'select_source_multichannelaudio') {
      action.actionId = 'select_source'
      action.options.matrix = matrixnames.multichannelaudio
      action.options.source_3 = action.options.source
      delete action.options.source
    } else if (action.actionId === 'select_source_gpio') {
      action.actionId = 'select_source'
      action.options.matrix = matrixnames.gpio
      action.options.source_4 = action.options.source
      delete action.options.source
    }
    changes.updatedActions.push(action)

    return action
  })

  // Feedbacks
  feedbacks.map((feedback: any) => {

    if (feedback.feedbackId === 'selected_source_video') {
      feedback.feedbackId = 'selected_source'
      feedback.options.matrix = matrixnames.video
      feedback.options.source_0 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'selected_source_audio') {
      feedback.feedbackId = 'selected_source'
      feedback.options.matrix = matrixnames.audio
      feedback.options.source_1 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'selected_source_data') {
      feedback.feedbackId = 'selected_source'
      feedback.options.matrix = matrixnames.data
      feedback.options.source_2 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'selected_source_multichannelaudio') {
      feedback.feedbackId = 'selected_source'
      feedback.options.matrix = matrixnames.multichannelaudio
      feedback.options.source_3 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'selected_source_gpio') {
      feedback.feedbackId = 'selected_source'
      feedback.options.matrix = matrixnames.gpio
      feedback.options.source_4 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'selected_target_video') {
      feedback.feedbackId = 'selected_target'
      feedback.options.matrix = matrixnames.video
      feedback.options.target_0 = feedback.options.target
      delete feedback.options.target
    } else if (feedback.feedbackId === 'selected_target_audio') {
      feedback.feedbackId = 'selected_target'
      feedback.options.matrix = matrixnames.audio
      feedback.options.target_1 = feedback.options.target
      delete feedback.options.target
    } else if (feedback.feedbackId === 'selected_target_data') {
      feedback.feedbackId = 'selected_target'
      feedback.options.matrix = matrixnames.data
      feedback.options.target_2 = feedback.options.target
      delete feedback.options.target
    } else if (feedback.feedbackId === 'selected_target_multichannelaudio') {
      feedback.feedbackId = 'selected_target'
      feedback.options.matrix = matrixnames.multichannelaudio
      feedback.options.target_3 = feedback.options.target
      delete feedback.options.target
    } else if (feedback.feedbackId === 'selected_target_gpio') {
      feedback.feedbackId = 'selected_target'
      feedback.options.matrix = matrixnames.gpio
      feedback.options.target_4 = feedback.options.target
      delete feedback.options.target
    } else if (feedback.feedbackId === 'take_tally_source_video') {
      feedback.feedbackId = 'take_tally_source'
      feedback.options.matrix = matrixnames.video
      feedback.options.source_0 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'take_tally_source_audio') {
      feedback.feedbackId = 'take_tally_source'
      feedback.options.matrix = matrixnames.audio
      feedback.options.source_1 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'take_tally_source_data') {
      feedback.feedbackId = 'take_tally_source'
      feedback.options.matrix = matrixnames.data
      feedback.options.source_2 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'take_tally_source_multichannelaudio') {
      feedback.feedbackId = 'take_tally_source'
      feedback.options.matrix = matrixnames.multichannelaudio
      feedback.options.source_3 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'take_tally_source_gpio') {
      feedback.feedbackId = 'take_tally_source'
      feedback.options.matrix = matrixnames.gpio
      feedback.options.source_4 = feedback.options.source
      delete feedback.options.source
    } else if (feedback.feedbackId === 'routing_tally_video') {
      feedback.feedbackId = 'routing_tally'
      feedback.options.matrix = matrixnames.video
      feedback.options.source_0 = feedback.options.source
      feedback.options.target_0 = feedback.options.target
      delete feedback.options.target
      delete feedback.options.source
    } else if (feedback.feedbackId === 'routing_tally_audio') {
      feedback.feedbackId = 'routing_tally'
      feedback.options.matrix = matrixnames.audio
      feedback.options.source_1 = feedback.options.source
      feedback.options.target_1 = feedback.options.target
      delete feedback.options.target
      delete feedback.options.source
    } else if (feedback.feedbackId === 'routing_tally_data') {
      feedback.feedbackId = 'routing_tally'
      feedback.options.matrix = matrixnames.data
      feedback.options.source_2 = feedback.options.source
      feedback.options.target_2 = feedback.options.target
      delete feedback.options.target
      delete feedback.options.source
    } else if (feedback.feedbackId === 'routing_tally_multichannelaudio') {
      feedback.feedbackId = 'routing_tally'
      feedback.options.matrix = matrixnames.multichannelaudio
      feedback.options.source_3 = feedback.options.source
      feedback.options.target_3 = feedback.options.target
      delete feedback.options.target
      delete feedback.options.source
    } else if (feedback.feedbackId === 'routing_tally_gpio') {
      feedback.feedbackId = 'routing_tally'
      feedback.options.matrix = matrixnames.gpio
      feedback.options.source_4 = feedback.options.source
      feedback.options.target_4 = feedback.options.target
      delete feedback.options.target
      delete feedback.options.source
    }
    changes.updatedFeedbacks.push(feedback)

    return feedback
  })

  return changes
}

export const getUpgrades = (): CompanionStaticUpgradeScript<DeviceConfig>[] => {
  return [upgradeV1_2_0]
}