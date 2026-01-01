// service.ts
import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async () => {
    try {
      const { position, duration } = await TrackPlayer.getProgress();
      // Ensure we don't seek past the end
      const newPosition = Math.min(position + 10, duration); 
      await TrackPlayer.seekTo(newPosition);
    } catch (error) {
      console.error('Failed to seek forward', error);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async () => {
    try {
      const { position } = await TrackPlayer.getProgress();
      // Ensure we don't seek past 0
      const newPosition = Math.max(position - 10, 0);
      await TrackPlayer.seekTo(newPosition);
    } catch (error) {
      console.error('Failed to seek backward', error);
    }
  });
};