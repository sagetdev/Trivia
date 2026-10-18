import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme';
import { Screen } from '../components/Screen';
import { Button, IconButton, Text } from '../components/ui';
import { SettingsRow, SettingsSection } from '../components/features';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <Screen scroll contentStyle={{ paddingBottom: 34 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />
        <Text size={24} weight="bold">
          Settings
        </Text>
      </View>

      <SettingsSection title="Account">
        <SettingsRow icon="pencil" label="Edit profile" onPress={() => {}} />
        <SettingsRow icon="bell" label="Notifications" toggle={notifications} onToggle={setNotifications} last />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow icon="volume" label="Sound effects" toggle={sound} onToggle={setSound} />
        <SettingsRow icon="moon" label="Dark mode" toggle={dark} onToggle={setDark} />
        <SettingsRow icon="globe" label="Language" value="English" onPress={() => {}} last />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsRow icon="help" label="Help center" onPress={() => {}} />
        <SettingsRow icon="shield" label="Privacy policy" onPress={() => {}} last />
      </SettingsSection>

      <Button label="Log out" variant="secondary" textColor={colors.error} onPress={() => router.replace('/welcome')} />
    </Screen>
  );
}
