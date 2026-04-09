export const VoiceModelName = { doubao: 'doubao', local_cosyvoice: 'local_cosyvoice' } as const;

export type VoiceModelName = (typeof VoiceModelName)[keyof typeof VoiceModelName];