/*import React from 'react';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay } from 'react-native-reanimated';

export type MovingTextProps = {
	text: string;
	animationThreshold: number;
	style?: string;
}

const MovingText = ({ text, animationThreshold, style }: MovingTextProps) => {
    const translateX = useSharedValue(0);
    const shouldAnimate = text.length >= animationThreshold;
    const textWidth = text.length * 5;

    React.useEffect(() => {
        if(!shouldAnimate) return;
        translateX.value = withDelay(
			1000,
			withRepeat(
				withTiming(-textWidth, {
					duration: 5000,
					easing: Easing.linear,
				}),
				-1,
				true,
			),
		)
        return () => {
            cancelAnimation(translateX);
            translateX.value = 0;
        }

    }, [translateX, text, animationThreshold, shouldAnimate, textWidth])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }]
        }
    })
    return (
       <Animated.Text numberOfLines={1} 
       className={`${style} ${shouldAnimate ? 'w-[9999px]' : ''}`} style={[animatedStyle]}>{text}</Animated.Text>
    )
}*/

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
};

const MovingText = ({ text, animationThreshold, style }: MovingTextProps) => {
  const translateX = useSharedValue(0);
  const shouldAnimate = text.length >= animationThreshold;

  const textWidth = text.length * 5;

  //constant speed
  const SPEED_PX_PER_SEC = 25;

  //duration derived from distance so speed is constant
  const durationMs = Math.max(1500, Math.round((textWidth / SPEED_PX_PER_SEC) * 1000)); //withTiming(-textWidth, { duration: 5000 })

  React.useEffect(() => {
    if (!shouldAnimate) return;

    translateX.value = 0; // start consistent each time

    translateX.value = withDelay(
      1000,
      withRepeat(
        withTiming(-textWidth, {
          duration: durationMs,
          easing: Easing.linear,
        }),
        -1,
        true // ping-pong back
      )
    );

    return () => {
      cancelAnimation(translateX);
      translateX.value = 0;
    };
  }, [translateX, shouldAnimate, textWidth, durationMs]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.Text
      numberOfLines={1}
      className={`${style} ${shouldAnimate ? 'w-[9999px]' : ''}`}
      style={[animatedStyle]}
    >
      {text}
    </Animated.Text>
  );
};

export default MovingText


