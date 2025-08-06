import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import commonStyles, { colors, spacing } from '../styles/common';

const styles = StyleSheet.create({
  ...commonStyles,
  section: {
    backgroundColor: colors.surface,
  },
});
import { List, Switch, Divider, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  language: 'en' | 'ur';
  notifications: boolean;
  locationServices: boolean;
  darkMode: boolean;
  offlineMode: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SettingsState>({
    language: 'en',
    notifications: true,
    locationServices: true,
    darkMode: false,
    offlineMode: false,
  });

  const updateSetting = async (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <List.Section style={styles.section}>
        <List.Subheader>General Settings</List.Subheader>
        
        <List.Item
          title="Language"
          description="Choose your preferred language"
          left={props => <List.Icon {...props} icon="translate" />}
          right={() => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[{ marginRight: 8 }, settings.language === 'en' && { fontWeight: 'bold' }]}
                onPress={() => updateSetting('language', 'en')}
              >
                English
              </Text>
              <Text
                style={settings.language === 'ur' && { fontWeight: 'bold' }}
                onPress={() => updateSetting('language', 'ur')}
              >
                اردو
              </Text>
            </View>
          )}
        />
        <Divider />

        <List.Item
          title="Push Notifications"
          description="Receive updates about service changes"
          left={props => <List.Icon {...props} icon="bell-outline" />}
          right={() => (
            <Switch
              value={settings.notifications}
              onValueChange={value => updateSetting('notifications', value)}
            />
          )}
        />
        <Divider />

        <List.Item
          title="Location Services"
          description="Allow app to access your location"
          left={props => <List.Icon {...props} icon="map-marker-outline" />}
          right={() => (
            <Switch
              value={settings.locationServices}
              onValueChange={value => updateSetting('locationServices', value)}
            />
          )}
        />
        <Divider />

        <List.Item
          title="Dark Mode"
          description="Switch between light and dark themes"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={settings.darkMode}
              onValueChange={value => updateSetting('darkMode', value)}
            />
          )}
        />
        <Divider />

        <List.Item
          title="Offline Mode"
          description="Access routes and schedules without internet"
          left={props => <List.Icon {...props} icon="cloud-offline-outline" />}
          right={() => (
            <Switch
              value={settings.offlineMode}
              onValueChange={value => updateSetting('offlineMode', value)}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>About</List.Subheader>
        
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        <Divider />

        <List.Item
          title="Terms of Service"
          description="Read our terms and conditions"
          left={props => <List.Icon {...props} icon="file-document-outline" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Privacy Policy"
          description="Learn about data usage and privacy"
          left={props => <List.Icon {...props} icon="shield-outline" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Contact Support"
          description="Get help with the app"
          left={props => <List.Icon {...props} icon="help-circle-outline" />}
          onPress={() => {}}
        />
      </List.Section>
    </ScrollView>
  );
}