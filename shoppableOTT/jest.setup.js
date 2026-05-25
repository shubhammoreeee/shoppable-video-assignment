import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-worklets', () => {
  return {
    Worklets: {
      createRunOnJS: (fn) => fn,
      createRunOnUI: (fn) => fn,
    },
    createSerializable: (val) => val,
    isWorklet: () => false,
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

jest.mock('react-native-screens', () => {
  return {
    enableScreens: jest.fn(),
    ScreenContainer: ({ children }) => children,
    Screen: ({ children }) => children,
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('react-native-orientation-locker', () => {
  return {
    lockToPortrait: jest.fn(),
    lockToLandscape: jest.fn(),
    unlockAllOrientations: jest.fn(),
    addOrientationListener: jest.fn(),
    removeOrientationListener: jest.fn(),
  };
});

jest.mock('react-native-video', () => 'Video');
