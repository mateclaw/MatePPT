import mitt, { type Emitter } from 'mitt'

export const enum EmitterEvents {
  RICH_TEXT_COMMAND = 'RICH_TEXT_COMMAND',
  SYNC_RICH_TEXT_ATTRS_TO_STORE = 'SYNC_RICH_TEXT_ATTRS_TO_STORE',
  OPEN_CHART_DATA_EDITOR = 'OPEN_CHART_DATA_EDITOR',
  OPEN_LATEX_EDITOR = 'OPEN_LATEX_EDITOR',
  DIGITBOT_AVATAR_REMOVE = 'DIGITBOT_AVATAR_REMOVE',
}

export type RichTextColorValue =
  | string
  | {
      color: string
      scheme?: string
      transforms?: string
    }

export interface RichTextAction {
  command: string
  value?: string | RichTextColorValue
}

export interface RichTextCommand {
  target?: string
  action: RichTextAction | RichTextAction[]
}

type Events = {
  [EmitterEvents.RICH_TEXT_COMMAND]: RichTextCommand
  [EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE]: void
  [EmitterEvents.OPEN_CHART_DATA_EDITOR]: void
  [EmitterEvents.OPEN_LATEX_EDITOR]: void
  [EmitterEvents.DIGITBOT_AVATAR_REMOVE]: { avatarKey?: string } | void
} 

export const emitter: Emitter<Events> = mitt<Events>()

export default emitter
