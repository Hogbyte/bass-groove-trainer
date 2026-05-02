import * as Tone from 'tone'

/** Start Tone.js from a user gesture; required for audio output and reliable timing. */
export async function startTone(): Promise<void> {
  await Tone.start()
}

export function getNativeAudioContext(): AudioContext {
  return Tone.getContext().rawContext as AudioContext
}
