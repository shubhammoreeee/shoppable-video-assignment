import React from "react";
import { Text, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../../features/home/screens/HomeScreen";
import { ErrorBoundary } from "../../shared/components/ErrorBoundary";

const Tab = createBottomTabNavigator();

const loadUploadScreen = () =>
  require("../../features/upload/screens/UploadScreen").default;

type TabIconProps = {
  label: string;
  color: string;
};

const TabIcon = ({ label, color }: TabIconProps) => (
  <Text style={[styles.tabIcon, { color }]}>{label}</Text>
);

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

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: styles.scene,
        lazy: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeWithBoundary}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon label="⌂" color={color} />,
        }}
      />
      <Tab.Screen
        name="UploadTab"
        component={UploadWithBoundary}
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => <TabIcon label="↑" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
});
