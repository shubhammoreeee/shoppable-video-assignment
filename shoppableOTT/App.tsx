import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import AppNavigator from "./src/app/navigation/AppNavigator";
import { ErrorBoundary } from "./src/shared/components/ErrorBoundary";

enableScreens(true);

const App = () => {
  return (
    <ErrorBoundary label="App">
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0F0F0F" }}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;
