import * as React from 'react';
import { Animated, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Route, useTheme } from '@react-navigation/native';
import { Props as HeaderContainerProps } from '../Header/HeaderContainer';
import Card from './Card';
import HeaderHeightContext from '../../utils/HeaderHeightContext';
import HeaderShownContext from '../../utils/HeaderShownContext';
import {
  Scene,
  Layout,
  StackHeaderMode,
  StackCardMode,
  TransitionPreset,
} from '../../types';

type Props = TransitionPreset & {
  index: number;
  active: boolean;
  focused: boolean;
  closing: boolean;
  layout: Layout;
  gesture: Animated.Value;
  previousScene?: Scene<Route<string>>;
  scene: Scene<Route<string>>;
  safeAreaInsetTop: number;
  safeAreaInsetRight: number;
  safeAreaInsetBottom: number;
  safeAreaInsetLeft: number;
  cardOverlay?: (props: { style: StyleProp<ViewStyle> }) => React.ReactNode;
  cardOverlayEnabled?: boolean;
  cardShadowEnabled?: boolean;
  cardStyle?: StyleProp<ViewStyle>;
  getPreviousRoute: (props: {
    route: Route<string>;
  }) => Route<string> | undefined;
  getFocusedRoute: () => Route<string>;
  renderHeader: (props: HeaderContainerProps) => React.ReactNode;
  renderScene: (props: { route: Route<string> }) => React.ReactNode;
  onOpenRoute: (props: { route: Route<string> }) => void;
  onCloseRoute: (props: { route: Route<string> }) => void;
  onTransitionStart?: (
    props: { route: Route<string> },
    closing: boolean
  ) => void;
  onTransitionEnd?: (props: { route: Route<string> }, closing: boolean) => void;
  onPageChangeStart?: () => void;
  onPageChangeConfirm?: () => void;
  onPageChangeCancel?: () => void;
  gestureEnabled?: boolean;
  gestureResponseDistance?: {
    vertical?: number;
    horizontal?: number;
  };
  gestureVelocityImpact?: number;
  mode: StackCardMode;
  headerMode: StackHeaderMode;
  headerShown: boolean;
  hasAbsoluteHeader: boolean;
  headerHeight: number;
  onHeaderHeightChange: (props: {
    route: Route<string>;
    height: number;
  }) => void;
};

const EPSILON = 0.1;

function CardContainer({
  active,
  cardOverlay,
  cardOverlayEnabled,
  cardShadowEnabled,
  cardStyle,
  cardStyleInterpolator,
  closing,
  gesture,
  focused,
  gestureDirection,
  gestureEnabled,
  gestureResponseDistance,
  gestureVelocityImpact,
  getPreviousRoute,
  getFocusedRoute,
  mode,
  headerMode,
  headerShown,
  headerStyleInterpolator,
  hasAbsoluteHeader,
  headerHeight,
  onHeaderHeightChange,
  index,
  layout,
  onCloseRoute,
  onOpenRoute,
  onPageChangeCancel,
  onPageChangeConfirm,
  onPageChangeStart,
  onTransitionEnd,
  onTransitionStart,
  previousScene,
  renderHeader,
  renderScene,
  safeAreaInsetBottom,
  safeAreaInsetLeft,
  safeAreaInsetRight,
  safeAreaInsetTop,
  scene,
  transitionSpec,
}: Props) {
  React.useEffect(() => {
    onPageChangeConfirm?.();
  }, [active, onPageChangeConfirm]);

  const handleOpen = () => {
    onTransitionEnd?.({ route: scene.route }, false);
    onOpenRoute({ route: scene.route });
  };

  const handleClose = () => {
    onTransitionEnd?.({ route: scene.route }, true);
    onCloseRoute({ route: scene.route });
  };

  const handleTransitionStart = ({ closing }: { closing: boolean }) => {
    if (active && closing) {
      onPageChangeConfirm?.();
    } else {
      onPageChangeCancel?.();
    }

    onTransitionStart?.({ route: scene.route }, closing);
  };

  const insets = {
    top: safeAreaInsetTop,
    right: safeAreaInsetRight,
    bottom: safeAreaInsetBottom,
    left: safeAreaInsetLeft,
  };

  const { colors } = useTheme();

  const [pointerEvents, setPointerEvents] = React.useState<'box-none' | 'none'>(
    'box-none'
  );

  React.useEffect(() => {
    // `addListener` may not exist on web and older versions of React Native
    // @ts-ignore
    const listener = scene.progress.next?.addListener?.(
      ({ value }: { value: number }) => {
        setPointerEvents(value <= EPSILON ? 'box-none' : 'none');
      }
    );

    return () => {
      if (listener) {
        // @ts-ignore
        scene.progress.next?.removeListener?.(listener);
      }
    };
  }, [pointerEvents, scene.progress.next]);

  const isParentHeaderShown = React.useContext(HeaderShownContext);
  const isCurrentHeaderShown = headerMode !== 'none' && headerShown !== false;

  return (
    <Card
      index={index}
      gestureDirection={gestureDirection}
      layout={layout}
      insets={insets}
      gesture={gesture}
      current={scene.progress.current}
      next={scene.progress.next}
      closing={closing}
      onOpen={handleOpen}
      onClose={handleClose}
      overlay={cardOverlay}
      overlayEnabled={cardOverlayEnabled}
      shadowEnabled={cardShadowEnabled}
      onTransitionStart={handleTransitionStart}
      onGestureBegin={onPageChangeStart}
      onGestureCanceled={onPageChangeCancel}
      gestureEnabled={gestureEnabled}
      gestureResponseDistance={gestureResponseDistance}
      gestureVelocityImpact={gestureVelocityImpact}
      transitionSpec={transitionSpec}
      styleInterpolator={cardStyleInterpolator}
      accessibilityElementsHidden={!focused}
      importantForAccessibility={focused ? 'auto' : 'no-hide-descendants'}
      pointerEvents={active ? 'box-none' : pointerEvents}
      pageOverflowEnabled={headerMode === 'screen' && mode === 'card'}
      containerStyle={hasAbsoluteHeader ? { marginTop: headerHeight } : null}
      contentStyle={[{ backgroundColor: colors.background }, cardStyle]}
      style={StyleSheet.absoluteFill}
    >
      <View style={styles.container}>
        <View style={styles.scene}>
          <HeaderShownContext.Provider
            value={isParentHeaderShown || isCurrentHeaderShown}
          >
            <HeaderHeightContext.Provider value={headerHeight}>
              {renderScene({ route: scene.route })}
            </HeaderHeightContext.Provider>
          </HeaderShownContext.Provider>
        </View>
        {headerMode === 'screen'
          ? renderHeader({
              mode: 'screen',
              layout,
              insets,
              scenes: [previousScene, scene],
              getPreviousRoute,
              getFocusedRoute,
              gestureDirection,
              styleInterpolator: headerStyleInterpolator,
              onContentHeightChange: onHeaderHeightChange,
            })
          : null}
      </View>
    </Card>
  );
}

export default React.memo(CardContainer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  scene: {
    flex: 1,
  },
});
