import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../../theme';
import { Button, Text } from '../ui';

export function DailyChallengeCard({ onPlay }: { onPlay: () => void }) {
  return (
    <View style={styles.card}>
      <View style={[styles.decor, { left: 190, top: -70, width: 190, height: 190, opacity: 0.1 }]} />
      <View style={[styles.decor, { left: 250, top: 60, width: 110, height: 110, opacity: 0.08 }]} />

      <View style={styles.pill}>
        <Text size={11} weight="semibold" color={colors.primary} letterSpacing={0.4}>
          DAILY CHALLENGE
        </Text>
      </View>
      <Text size={24} weight="bold" color={colors.onPrimary}>
        Today’s mixed quiz
      </Text>
      <Text size={14} color={colors.onPrimary} style={{ opacity: 0.85 }}>
        10 questions · Earn 2× XP · about 3 min
      </Text>
      <Button label="Play now" variant="secondary" textColor={colors.primary} onPress={onPlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radii.xxl,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.onPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
});
