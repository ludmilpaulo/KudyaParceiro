import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: any;
}) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={["top", "left", "right"]}>
      <View style={[styles.view, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  view: {
    // flex: 1
  },
});
