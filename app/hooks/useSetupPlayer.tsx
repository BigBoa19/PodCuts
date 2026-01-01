// hooks/useSetupPlayer.ts
import { useEffect, useRef } from 'react';
import TrackPlayer, { Capability } from 'react-native-track-player';

const useSetupPlayer = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    const setup = async () => {
      if (isInitialized.current) return;
      
      try {
        await TrackPlayer.setupPlayer();
        console.log("Player setup successfully");
      } catch (error) {
        console.log("Player already setup, refreshing options...");
      }

      try {
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.JumpForward, 
            Capability.JumpBackward,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.JumpForward,
            Capability.JumpBackward,
          ],
          forwardJumpInterval: 30,
          backwardJumpInterval: 30,
        });
        
        isInitialized.current = true;
        console.log("Options updated successfully");
      } catch (e) {
        console.error("Failed to update options", e);
      }
    };

    setup();
  }, []);
};

export default useSetupPlayer;