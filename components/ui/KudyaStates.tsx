import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { theme } from "../../configs/theme";

export function KudyaEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border }}>
      <Text style={{ fontWeight: "700", color: theme.colors.text }}>{title}</Text>
      <Text style={{ marginTop: 4, color: theme.colors.textSecondary }}>{body}</Text>
    </View>
  );
}

export function KudyaErrorState({
  title,
  body,
  onRetry,
  retryLabel,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
  retryLabel: string;
}) {
  return (
    <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.error }}>
      <Text style={{ fontWeight: "700", color: theme.colors.error }}>{title}</Text>
      <Text style={{ marginTop: 4, color: theme.colors.textSecondary }}>{body}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function KudyaLoading() {
  return <ActivityIndicator color={theme.colors.primary} />;
}
