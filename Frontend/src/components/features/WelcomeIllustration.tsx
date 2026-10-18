import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadows } from '../../theme';
import { Icon, IconName, Text } from '../ui';

const floating: { icon: IconName; bg: string; fg: string; left: number; top: number; rotate: string }[] = [
  { icon: 'flask', bg: colors.category.blue.bg, fg: colors.category.blue.fg, left: 24, top: 49, rotate: '10deg' },
  { icon: 'trophy', bg: colors.category.orange.bg, fg: colors.category.orange.fg, left: 261, top: 65, rotate: '-9deg' },
  { icon: 'globe', bg: colors.category.green.bg, fg: colors.category.green.fg, left: 62, top: 260, rotate: '-7deg' },
  { icon: 'zap', bg: colors.category.purple.bg, fg: colors.category.purple.fg, left: 231, top: 282, rotate: '8deg' },
];

export function WelcomeIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.decor, { left: -80, top: -90, width: 300, height: 300, opacity: 0.1 }]} />
      <View style={[styles.decor, { left: 170, top: 230, width: 240, height: 240, opacity: 0.08 }]} />
      <View style={[styles.decor, { left: 230, top: -30, width: 120, height: 120, opacity: 0.12 }]} />

      <View style={styles.questionWrap} pointerEvents="none">
        <Text size={190} weight="bold" color={colors.onPrimary} style={{ lineHeight: 230 }}>
          ?
        </Text>
      </View>

      {floating.map((f) => (
        <View
          key={f.icon}
          style={[
            styles.card,
            shadows.floating,
            { left: f.left, top: f.top, backgroundColor: f.bg, transform: [{ rotate: f.rotate }] },
          ]}
        >
          <Icon name={f.icon} size={32} color={f.fg} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 380,
    width: '100%',
    borderRadius: radii.hero,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  decor: { position: 'absolute', borderRadius: 999, backgroundColor: '#FFFFFF' },
  questionWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    padding: 16,
    borderRadius: 20,
  },
});
