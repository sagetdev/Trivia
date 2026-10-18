import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Icon, IconName, Text } from './ui';

const tabs: Record<string, { label: string; icon: IconName }> = {
  home: { label: 'Home', icon: 'home' },
  explore: { label: 'Explore', icon: 'search' },
  ranking: { label: 'Ranking', icon: 'trophy' },
  profile: { label: 'Profile', icon: 'user' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {state.routes.map((route, index) => {
        const cfg = tabs[route.name];
        if (!cfg) return null;
        const focused = state.index === index;
        const color = focused ? colors.primary : colors.textFaint;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.tab}
          >
            <Icon name={cfg.icon} size={24} color={color} />
            <Text size={11} weight={focused ? 'semibold' : 'medium'} color={color}>
              {cfg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
});
