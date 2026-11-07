import { StyleSheet } from "react-native";

export const GREEN = "#0B8F45";
export const DARK = "#056B34";
export const MUTED = "#6B7280";
export const BORDER = "#E5E7EB";
export const BG = "#F8FAF9";

export function formatMoney(value: number, currency = "ZAR"): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

export function statusColor(status: string): { bg: string; text: string } {
  if (status === "new") return { bg: "#EFF6FF", text: "#1D4ED8" };
  if (status === "cancelled" || status === "refunded") return { bg: "#FEF2F2", text: "#B91C1C" };
  if (status === "delivered") return { bg: "#ECFDF5", text: "#047857" };
  if (status === "ready") return { bg: "#FFFBEB", text: "#92400E" };
  return { bg: "#F1F5F9", text: "#334155" };
}

export const groceryStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { color: MUTED, marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kpi: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  kpiLabel: { color: MUTED, fontSize: 12 },
  kpiValue: { fontSize: 20, fontWeight: "800", marginTop: 6, color: "#111827" },
  kpiChange: { fontSize: 11, fontWeight: "600", marginTop: 4 },
  primary: {
    backgroundColor: GREEN,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondaryText: { color: DARK, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  chip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  chipOn: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { color: "#111827", fontSize: 13, fontWeight: "600" },
  chipTextOn: { color: "#fff", fontSize: 13, fontWeight: "600" },
  muted: { color: MUTED },
  group: { fontSize: 11, fontWeight: "700", color: MUTED, textTransform: "uppercase", marginTop: 8 },
});
