import React, { useEffect } from 'react';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay } from 'react-native-reanimated';

export type MovingTextProps = {
	text: string;
	animationThreshold: number;
	style?: string;
}

const MovingText = ({ text, animationThreshold, style }: MovingTextProps) => {
    const translateX = useSharedValue(0);
    const shouldAnimate = text.length >= animationThreshold;
    const textWidth = text.length * 3;

    useEffect(() => {
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
}

export default MovingText