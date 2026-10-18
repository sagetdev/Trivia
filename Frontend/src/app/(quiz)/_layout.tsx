import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="play" options={{ gestureEnabled: false }} />
      <Stack.Screen name="results" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
