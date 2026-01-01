import React from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

export type MovingTextProps = {
  text: string;
  animationThreshold: number;
  style?: string;
  charWidth?: number;
};

const MovingText = ({
  text,
  animationThreshold,
  style,
  charWidth = 5,
}: MovingTextProps) => {
  const translateX = useSharedValue(0);

  // keep your short-text rule if you added it earlier
  const shouldAnimate = text.length >= animationThreshold && text.length >= 25;

  const textWidth = text.length * charWidth;

  const SPEED_PX_PER_SEC = 25;
  const durationMs = Math.max(
    1500,
    Math.round((textWidth / SPEED_PX_PER_SEC) * 1000)
  );

  React.useEffect(() => {
    if (!shouldAnimate) {
      cancelAnimation(translateX);
      translateX.value = 0;
      return;
    }

    translateX.value = 0;

    translateX.value = withDelay(
      1000,
      withRepeat(
        withTiming(-textWidth, {
          duration: durationMs,
          easing: Easing.linear,
        }),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(translateX);
      translateX.value = 0;
    };
  }, [translateX, shouldAnimate, textWidth, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.Text
      numberOfLines={1}
      className={`${style} ${shouldAnimate ? 'w-[9999px]' : ''}`}
      style={animatedStyle}
    >
      {text}
    </Animated.Text>
  );
};

export default MovingText;
