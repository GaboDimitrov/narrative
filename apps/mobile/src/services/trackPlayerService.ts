import TrackPlayer, { Event, RepeatMode, Capability } from 'react-native-track-player';

export async function setupPlayer() {
  let isSetup = false;
  try {
    // Check if player is already initialized
    await TrackPlayer.getActiveTrackIndex();
    isSetup = true;
  } catch {
    // Player not initialized, set it up
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });
    
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
      ],
      forwardJumpInterval: 15,
      backwardJumpInterval: 15,
      progressUpdateEventInterval: 1,
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    isSetup = true;
  }
  return isSetup;
}

export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
    const position = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(position.position + event.interval);
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
    const position = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(Math.max(0, position.position - event.interval));
  });
}
