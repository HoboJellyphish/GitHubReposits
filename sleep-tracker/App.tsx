import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { LogsProvider } from '@/context/LogsContext';
import { MedicationCatalogProvider } from '@/context/MedicationCatalogContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { colors } from '@/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <MedicationCatalogProvider>
            <LogsProvider>
              <View style={styles.flex}>
                <StatusBar style="light" />
                <RootNavigator />
              </View>
            </LogsProvider>
          </MedicationCatalogProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
