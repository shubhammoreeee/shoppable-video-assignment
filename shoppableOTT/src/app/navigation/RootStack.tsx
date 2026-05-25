import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Lazy-load player so home/tabs mount without video/reanimated native deps. */
const loadPlayerScreen = () =>
  require("../../features/player/screens/PlayerScreen").default;

const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { flex: 1, backgroundColor: "#0F0F0F" },
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen
        name="Player"
        getComponent={loadPlayerScreen}
        options={{
          animation: "fade",
          presentation: "transparentModal",
          contentStyle: { flex: 1, backgroundColor: "transparent" },
        }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
