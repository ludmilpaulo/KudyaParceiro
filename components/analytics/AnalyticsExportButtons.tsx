import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import {
  buildAnalyticsCsv,
  buildAnalyticsPrintHtml,
  type AnalyticsExportPayload,
} from "../../utils/analyticsExport";

type Props = {
  payload: AnalyticsExportPayload;
  exportCsvLabel?: string;
  exportPdfLabel?: string;
};

export default function AnalyticsExportButtons({
  payload,
  exportCsvLabel = "Export CSV",
  exportPdfLabel = "Export PDF",
}: Props) {
  const handleCsv = async () => {
    await Share.share({
      title: payload.title,
      message: buildAnalyticsCsv(payload),
    });
  };

  const handlePdf = async () => {
    // Share printable HTML summary so users can save/print from their device share sheet.
    await Share.share({
      title: `${payload.title} PDF`,
      message: buildAnalyticsPrintHtml(payload).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });
  };

  return (
    <View style={styles.row}>
      <Pressable style={styles.btn} onPress={() => void handleCsv()}>
        <Text style={styles.btnText}>{exportCsvLabel}</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => void handlePdf()}>
        <Text style={[styles.btnText, styles.btnTextPrimary]}>{exportPdfLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnPrimary: { backgroundColor: "#f0fdfa", borderColor: "#99f6e4" },
  btnText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  btnTextPrimary: { color: "#0f766e" },
});
