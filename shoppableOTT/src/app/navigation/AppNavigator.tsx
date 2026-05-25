import React from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import RootStack from "./RootStack";
import { ErrorBoundary } from "../../shared/components/ErrorBoundary";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0F0F0F",
    card: "#111111",
    text: "#FFFFFF",
    border: "#2A2A2A",
    primary: "#E50914",
  },
};

const AppNavigator = () => {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      <ErrorBoundary label="Navigation">
        <NavigationContainer theme={navTheme}>
          <RootStack />
        </NavigationContainer>
      </ErrorBoundary>
    </View>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
});
