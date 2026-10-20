import React from "react";
import { Alert, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { IconButton, Text } from "../components/ui";
import { SettingsRow, SettingsSection } from "../components/features";
import { colors } from "../theme";

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <Screen scroll contentStyle={{ paddingBottom: 34 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />
        <Text size={24} weight="bold">Settings</Text>
      </View>
      <SettingsSection title="Account">
        <SettingsRow icon="pencil" label="Edit profile" onPress={() => router.push("/(tabs)/profile")} last />
      </SettingsSection>
      <SettingsSection title="Support">
        <SettingsRow icon="help" label="Help center" onPress={() => Alert.alert("Help center", "Si les questions ne chargent pas, vérifie que le backend est démarré et que l’URL API correspond à ton émulateur ou téléphone Android.")} />
        <SettingsRow icon="shield" label="Privacy information" onPress={() => Alert.alert("Privacy", "Ton pseudo, tes statistiques personnelles et ton historique local sont enregistrés sur cet appareil. Les parties terminées sont également envoyées au backend pour le classement. Aucun compte cloud n’est encore configuré.")} last />
      </SettingsSection>
      <View style={{ padding: 16, borderRadius: 16, backgroundColor: colors.surface }}>
        <Text size={13} color={colors.textMuted}>Le profil et les statistiques sont actuellement stockés sur cet appareil. La synchronisation entre appareils et les comptes seront ajoutés avec la base de données cloud.</Text>
      </View>
    </Screen>
  );
}
