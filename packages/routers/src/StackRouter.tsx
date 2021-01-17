import React, {memo, ReactNode, useEffect, useRef, useState} from 'react';
import {
	Animated,
	RefreshControl,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {scaledFontSize, scaledHeight, scaledWidth} from 'utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from 'components/icon';
import {COLORS, FONTS} from 'config/constants';
import {FullActivityIndicator} from 'components/fullActivityIndicator';
import {ImagesOverlayContainer} from 'components/overlays';
import {useSelector} from 'react-redux';
import {SWText} from 'components/swText';
import {AppState} from 'utils/store';
import {
	HeaderImage,
	HotelHeaderImage,
	HeaderAbsoluteImage,
	HeaderImageContainer,
	HeaderText
} from '../atoms';

export default memo(
	({
		imageUUID,
		headerTitle = '',
		isRefreshing,
		onRefresh,
		onPress,
		onSharePress,
		galleryCount,
		share,
		children,
		isHotel,
		scrollViewRef
	}: {
		imageUUID: string;
		headerTitle?: string;
		isRefreshing: boolean;
		onRefresh: () => void;
		children: ReactNode;
		galleryCount?: number;
		share?: boolean;
		onPress?: () => void;
		onSharePress?: () => void;
		isHotel?: boolean;
		scrollViewRef?: any;
	}) => {
		const [scrollValue] = useState(new Animated.Value(0));
		const navigation = useNavigation<any>();
		const showingOpacity = scrollValue.interpolate({
			inputRange: [-scaledWidth(1000), scaledWidth(250)],
			outputRange: [scaledWidth(1500), scaledWidth(100)],
			extrapolate: 'clamp'
		});
		const headerBackgroundColor = scrollValue.interpolate({
			inputRange: [scaledWidth(150), scaledWidth(250)],
			outputRange: ['rgba(0,0,0,0)', 'rgba(92, 195, 238,1)'],
			extrapolate: 'clamp'
		});
		const headerTitleOpacity = scrollValue.interpolate({
			inputRange: [scaledWidth(150), scaledWidth(250)],
			outputRange: [0, 1],
			extrapolate: 'clamp'
		});
		useEffect(() => {
			navigation.setOptions({
				headerBackground: () => (
					<Animated.View
						style={{
							flex: 1,
							backgroundColor: headerBackgroundColor
						}}
					/>
				),
				headerTitle: () => (
					<Animated.View
						style={{
							opacity: headerTitleOpacity
						}}>
						<HeaderText>{headerTitle}</HeaderText>
					</Animated.View>
				)
			});
		}, [navigation, headerBackgroundColor, headerTitleOpacity, headerTitle]);
		const insets = useSafeAreaInsets();

		const uploadIds = useSelector((state: AppState) => state.post.uploadIds);
		const type = useSelector((state: AppState) => state.post.type);
		const scrollViewRefLocal = useRef<ScrollView>(null);
		return (
			<View style={{flex: 1, backgroundColor: COLORS.GREY_BACKGROUND}}>
				<StatusBar
					translucent
					barStyle="light-content"
					backgroundColor="transparent"
				/>
				<FullActivityIndicator animating={isRefreshing} />
				<Animated.ScrollView
					keyboardShouldPersistTaps="handled"
					removeClippedSubviews
					showsVerticalScrollIndicator={false}
					scrollEventThrottle={1}
					ref={scrollViewRef ?? scrollViewRefLocal}
					style={{
						marginBottom: insets.bottom
					}}
					onScroll={Animated.event(
						[
							{
								nativeEvent: {
									contentOffset: {
										y: scrollValue
									}
								}
							}
						],
						{
							useNativeDriver: false
						}
					)}
					refreshControl={
						<RefreshControl
							refreshing={false}
							onRefresh={() => {
								onRefresh();
							}}
						/>
					}>
					<TouchableOpacity
						onPress={() => {
							if (onPress) onPress();
						}}
						style={{
							height: scaledWidth(300)
						}}>
						{galleryCount !== undefined && galleryCount > 0 && (
							<TouchableOpacity
								onPress={() => {
									if (onPress) onPress();
								}}
								style={{
									position: 'absolute',
									top: Math.min(
										scaledHeight(90),
										scaledHeight(70) + insets.top
									),
									start: scaledWidth(10),
									backgroundColor: 'rgba(7,7,7,0.2)',
									borderRadius: scaledWidth(10),
									padding: scaledWidth(5),
									flexDirection: 'row'
								}}>
								<Icon
									iconName="gallery"
									width={scaledWidth(25)}
									aspectRatio={1}
								/>
								<Text
									style={{
										color: 'white',
										marginStart: scaledWidth(5),
										fontSize: scaledFontSize(15),
										fontFamily: FONTS.MEDIUM
									}}>
									({galleryCount})
								</Text>
							</TouchableOpacity>
						)}
						{share && (
							<TouchableOpacity
								onPress={() => {
									if (onSharePress) onSharePress();
								}}
								style={{
									position: 'absolute',
									top: Math.min(
										scaledHeight(90),
										scaledHeight(70) + insets.top
									),
									end: scaledWidth(10),
									backgroundColor: 'rgba(7,7,7,0.2)',
									borderRadius: scaledWidth(10),
									padding: scaledWidth(5),
									flexDirection: 'row'
								}}>
								<Icon
									iconName="share_white"
									width={scaledWidth(25)}
									aspectRatio={1}
								/>
							</TouchableOpacity>
						)}
					</TouchableOpacity>
					{children}
				</Animated.ScrollView>
				{uploadIds.length > 0 && (
					<View
						style={{
							height: scaledHeight(30),
							width: '100%',
							paddingHorizontal: scaledWidth(10),
							backgroundColor: COLORS.MAIN_COLOR,
							flexDirection: 'row',
							alignItems: 'center'
						}}>
						<SWText color="white">لديك {type} قيد الرفع الرجاء الانتظار</SWText>
					</View>
				)}
				<HeaderImageContainer
					style={{
						height: showingOpacity
					}}>
					{imageUUID && imageUUID.indexOf('http') !== -1 && (
						<HeaderAbsoluteImage imageUUID={imageUUID} />
					)}
					{!isHotel && !(imageUUID && imageUUID.indexOf('http') !== -1) && (
						<HeaderImage imageUUID={imageUUID} />
					)}
					{isHotel && !(imageUUID && imageUUID.indexOf('http') !== -1) && (
						<HotelHeaderImage imageUUID={imageUUID} />
					)}

					<ImagesOverlayContainer />
					{/* <OverlayContainer /> */}
				</HeaderImageContainer>
			</View>
		);
	}
);
