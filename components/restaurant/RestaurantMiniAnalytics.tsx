import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import AnalyticsDaysFilter, { type AnalyticsDays } from "../analytics/AnalyticsDaysFilter";
import AnalyticsComparisonStrip from "../analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "../analytics/AnalyticsExportButtons";
import {
  fetchPartnerReport,
  type PartnerReportData,
} from "../../features/partner/api/partnerReportsApi";
import { formatPercentChange, mapMetricComparison } from "../../utils/analyticsExport";

const emptyReport: PartnerReportData = {
  revenue: [],
  orders: [],
};

export default function RestaurantMiniAnalytics() {
  const [days, setDays] = useState<AnalyticsDays>(7);
  const [data, setData] = useState<PartnerReportData>(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const report = await fetchPartnerReport({ days });
        if (!cancelled) setData(report);
      } catch {
        if (!cancelled) setError("Could not load analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const revenueComparison = mapMetricComparison(data.comparison?.revenue);
  const ordersComparison = mapMetricComparison(data.comparison?.orders);

  const daysLabel = (value: AnalyticsDays) => {
    if (value === 30) return "30 days";
    if (value === 90) return "90 days";
    return "7 days";
  };

  const exportPayload = useMemo(
    () => ({
      title: "Store Report",
      subtitle: daysLabel(days),
      sections: [
        {
          title: "Period comparison",
          rows: [
            {
              label: "Revenue",
              value: `${revenueComparison.current} (${formatPercentChange(revenueComparison.percentChange)})`,
            },
            {
              label: "Orders",
              value: `${ordersComparison.current} (${formatPercentChange(ordersComparison.percentChange)})`,
            },
          ],
        },
      ],
    }),
    [data, days, revenueComparison, ordersComparison],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.hint}>Compared with previous period</Text>
      <AnalyticsDaysFilter value={days} onChange={setDays} labelFor={daysLabel} />
      <View style={styles.exportWrap}>
        <AnalyticsExportButtons payload={exportPayload} />
      </View>

      {loading ? (
        <ActivityIndicator color="#0f766e" style={{ marginTop: 12 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <AnalyticsComparisonStrip
          title="Period comparison"
          vsPreviousLabel="Compared with previous period"
          cards={[
            {
              key: "revenue",
              label: "Revenue",
              comparison: revenueComparison,
              formatValue: (value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 }),
            },
            {
              key: "orders",
              label: "Orders",
              comparison: ordersComparison,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  hint: { marginTop: 2, marginBottom: 10, fontSize: 12, color: "#64748b" },
  exportWrap: { marginBottom: 10 },
  error: { marginTop: 8, color: "#be123c" },
});
