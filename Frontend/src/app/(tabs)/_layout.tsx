import { Pressable, StyleSheet, View } from "react-native";
import { Slot, usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme";
import { Icon, type IconName, Text } from "../../components/ui";

const tabs: { name: string; label: string; icon: IconName; href: "/(tabs)/home" | "/(tabs)/explore" | "/(tabs)/ranking" | "/(tabs)/profile" }[] = [
  { name: "home", label: "Home", icon: "home", href: "/(tabs)/home" },
  { name: "explore", label: "Explore", icon: "search", href: "/(tabs)/explore" },
  { name: "ranking", label: "Ranking", icon: "trophy", href: "/(tabs)/ranking" },
  { name: "profile", label: "Profile", icon: "user", href: "/(tabs)/profile" },
];

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.content}><Slot /></View>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {tabs.map((tab) => {
          const focused = pathname.endsWith(`/${tab.name}`);
          const color = focused ? colors.primary : colors.textFaint;
          return (
            <Pressable key={tab.name} accessibilityRole="tab" accessibilityState={{ selected: focused }}
              onPress={() => router.replace(tab.href)} style={styles.tab}>
              <Icon name={tab.icon} size={23} color={color} />
              <Text size={11} weight={focused ? "semibold" : "medium"} color={color}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  bar: { flexDirection: "row", backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, paddingHorizontal: 12 },
  tab: { flex: 1, alignItems: "center", gap: 4 },
});
