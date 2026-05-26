import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../../features/home/screens/HomeScreen";
import { ErrorBoundary } from "../../shared/components/ErrorBoundary";
import CustomTabBar from "./CustomTabBar";

const Tab = createBottomTabNavigator();

const loadUploadScreen = () =>
  require("../../features/upload/screens/UploadScreen").default;

const HomeWithBoundary = () => (
  <ErrorBoundary label="Home">
    <HomeScreen />
  </ErrorBoundary>
);

const UploadWithBoundary = () => (
  <ErrorBoundary label="Upload">
    {React.createElement(loadUploadScreen())}
  </ErrorBoundary>
);

const BottomTabs = () => (
  <Tab.Navigator
    initialRouteName="HomeTab"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      sceneStyle: styles.scene,
      lazy: true,
      tabBarHideOnKeyboard: false,
    }}
  >
    <Tab.Screen name="HomeTab" component={HomeWithBoundary} />
    <Tab.Screen name="UploadTab" component={UploadWithBoundary} />
  </Tab.Navigator>
);

export default BottomTabs;

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
