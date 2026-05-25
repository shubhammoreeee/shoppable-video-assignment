import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";

type Props = {
  children: ReactNode;
  label?: string;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.label ?? "App"}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.label}>{this.props.label}</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>{this.state.error.message}</Text>
          </ScrollView>
          <Pressable
            style={styles.btn}
            onPress={() => this.setState({ error: null })}
          >
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  label: {
    color: "#888",
    marginBottom: 16,
  },
  scroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  message: {
    color: "#ff6b6b",
    fontSize: 14,
    lineHeight: 20,
  },
  btn: {
    backgroundColor: "#E50914",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
