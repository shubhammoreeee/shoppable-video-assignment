// import React from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { HomeIcon, UploadIcon } from "./TabBarIcons";

// const ACTIVE = "#FF7A00";
// const INACTIVE = "#9E9E9E";

// const TAB_LABELS: Record<string, string> = {
//   HomeTab: "HOME",
//   UploadTab: "UPLOAD",
// };

// const TabIconMap: Record<
//   string,
//   React.ComponentType<{ focused: boolean }>
// > = {
//   HomeTab: HomeIcon,
//   UploadTab: UploadIcon,
// };

// const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
//   const insets = useSafeAreaInsets();
//   const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 10 : 8);

//   return (
//     <View style={[styles.bar, { paddingBottom: bottomPad }]}>
//       {state.routes.map((route, index) => {
//         const focused = state.index === index;
//         const { options } = descriptors[route.key];
//         const label = TAB_LABELS[route.name] ?? options.title ?? route.name;
//         const Icon = TabIconMap[route.name] ?? HomeIcon;

//         const onPress = () => {
//           const event = navigation.emit({
//             type: "tabPress",
//             target: route.key,
//             canPreventDefault: true,
//           });
//           if (!focused && !event.defaultPrevented) {
//             navigation.navigate(route.name);
//           }
//         };

//         return (
//           <Pressable
//             key={route.key}
//             onPress={onPress}
//             style={styles.tab}
//             accessibilityRole="button"
//             accessibilityState={focused ? { selected: true } : {}}
//             accessibilityLabel={label}
//           >
//             <View style={[styles.iconPill, focused && styles.iconPillActive]}>
//               <Icon focused={focused} />
//             </View>
//             <Text
//               style={[styles.label, { color: focused ? ACTIVE : INACTIVE }]}
//               numberOfLines={1}
//             >
//               {label}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </View>
//   );
// };

// export default CustomTabBar;

// const styles = StyleSheet.create({
//   bar: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     justifyContent: "space-around",
//     backgroundColor: "#FFFFFF",
//     paddingTop: 10,
//     paddingHorizontal: 24,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: "#E8E8E8",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -1 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 12,
//   },
//   tab: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "flex-end",
//     minHeight: 58,
//     maxWidth: 160,
//   },
//   iconPill: {
//   width: 52,
//   height: 34,
//   borderRadius: 99,
//   overflow: "hidden",
//   alignItems: "center",
//   justifyContent: "center",
//   marginBottom: 5,
// },
//   iconPillActive: {
//     backgroundColor: "rgba(255, 122, 0, 0.14)",
//   },
//   label: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.4,
//     textAlign: "center",
//   },
// });
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import Octicons from "react-native-vector-icons/Octicons";
import Ionicons from "react-native-vector-icons/Ionicons";

const ACTIVE = "#FF7A00";
const INACTIVE = "#9E9E9E";

/** Base tab bar height (excluding safe-area inset). */
export const TAB_BAR_BASE_HEIGHT = 46;

const TAB_LABELS: Record<string, string> = {
  HomeTab: "HOME",
  UploadTab: "UPLOAD",
};

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 6 : 4);

  const renderIcon = (
    routeName: string,
    focused: boolean
  ) => {
    const color = focused ? ACTIVE : INACTIVE;
    const size = 22;

    switch (routeName) {
      case "HomeTab":
        return (
          <Ionicons
            name={focused ? "home" : "home-outline"}
            size={size}
            color={color}
          />
        );

      case "UploadTab":
        return (
          <Octicons
            name="upload"
            size={size}
            color={color}
          />
        );

      default:
        return (
          <Octicons
            name="home"
            size={size}
            color={color}
          />
        );
    }
  };

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: bottomPad,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;

        const { options } =
          descriptors[route.key];

        const label =
          TAB_LABELS[route.name] ??
          options.title ??
          route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (
            !focused &&
            !event.defaultPrevented
          ) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={
              focused
                ? { selected: true }
                : {}
            }
            accessibilityLabel={label}
          >
            <View
              style={[
                styles.iconPill,
                focused &&
                  styles.iconPillActive,
              ]}
            >
              {renderIcon(
                route.name,
                focused
              )}
            </View>

            <Text
              style={[
                styles.label,
                {
                  color: focused
                    ? ACTIVE
                    : INACTIVE,
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingTop: 6,
    paddingHorizontal: 24,
    minHeight: TAB_BAR_BASE_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 12,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 44,
    maxWidth: 160,
  },

  iconPill: {
    width: 44,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },

  iconPillActive: {
    backgroundColor:
      "rgba(255, 122, 0, 0.14)",
  },

  label: {
    fontSize: 10,
    fontWeight: "700",

    letterSpacing: 0.4,

    textAlign: "center",
  },
});