import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import type { AnalyticsDays } from "../analytics/AnalyticsDaysFilter";
import AnalyticsDaysFilter from "../analytics/AnalyticsDaysFilter";
import AnalyticsComparisonStrip from "../analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "../analytics/AnalyticsExportButtons";
import type { DoctorDashboardAnalytics } from "../../types/doctor";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import { formatPercentChange } from "../../utils/analyticsExport";

const chartWidth = Math.min(Dimensions.get("window").width - 48, 420);

type Props = {
  analytics: DoctorDashboardAnalytics;
  days: AnalyticsDays;
  onDaysChange: (days: AnalyticsDays) => void;
};

function hasAnyValue(data: number[]): boolean {
  return data.some((value) => value > 0);
}

export default function DoctorAnalyticsCharts({ analytics, days, onDaysChange }: Props) {
  const { dt, appointmentStatusLabel, appointmentTypeLabel } = useDoctorTranslation();

  const daysLabel = (value: AnalyticsDays) => {
    if (value === 30) return dt("days30");
    if (value === 90) return dt("days90");
    return dt("last7Days");
  };

  const exportPayload = useMemo(
    () => ({
      title: dt("analyticsTitle"),
      subtitle: daysLabel(days),
      sections: [
        {
          title: dt("comparisonTitle"),
          rows: [
            {
              label: dt("appointmentsMetric"),
              value: `${analytics.comparison.appointments.current} (${formatPercentChange(analytics.comparison.appointments.percentChange)})`,
            },
            {
              label: dt("earningsMetric"),
              value: `${analytics.comparison.earnings.current} (${formatPercentChange(analytics.comparison.earnings.percentChange)})`,
            },
          ],
        },
      ],
    }),
    [analytics, days, dt],
  );

  const hasData = useMemo(
    () =>
      [
        analytics.appointmentsByDay.data,
        analytics.appointmentsByStatus.data,
        analytics.appointmentTypeBreakdown.data,
        analytics.earningsByDay.data,
        analytics.topServices.data,
      ].some(hasAnyValue),
    [analytics],
  );

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ecfdf5",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
    labelColor: () => "#64748b",
    propsForBackgroundLines: { stroke: "#e2e8f0" },
  };

  const dayLabels = analytics.appointmentsByDay.labels.map((label) => label.slice(5));
  const statusLabels = analytics.appointmentsByStatus.labels.map((label) => appointmentStatusLabel(label));
  const typeLabels = analytics.appointmentTypeBreakdown.labels.map((label) => appointmentTypeLabel(label));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>{dt("analyticsTitle")}</Text>
      <AnalyticsDaysFilter value={days} onChange={onDaysChange} labelFor={daysLabel} />
      <View style={{ marginBottom: 10 }}>
        <AnalyticsExportButtons
          payload={exportPayload}
          exportCsvLabel={dt("exportCsv")}
          exportPdfLabel={dt("exportPdf")}
        />
      </View>
      <AnalyticsComparisonStrip
        title={dt("comparisonTitle")}
        vsPreviousLabel={dt("vsPreviousPeriod")}
        cards={[
          {
            key: "appointments",
            label: dt("appointmentsMetric"),
            comparison: analytics.comparison.appointments,
          },
          {
            key: "earnings",
            label: dt("earningsMetric"),
            comparison: analytics.comparison.earnings,
          },
        ]}
      />

      {!hasData ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{dt("noAnalyticsData")}</Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{dt("appointmentsTrend")}</Text>
              <LineChart
                data={{
                  labels: dayLabels,
                  datasets: [{ data: analytics.appointmentsByDay.data.length ? analytics.appointmentsByDay.data : [0] }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero
              />
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{dt("earningsTrend")}</Text>
              <LineChart
                data={{
                  labels: analytics.earningsByDay.labels.map((label) => label.slice(5)),
                  datasets: [{ data: analytics.earningsByDay.data.length ? analytics.earningsByDay.data : [0] }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
              />
            </View>
          </ScrollView>

          <View style={styles.chartCardFull}>
            <Text style={styles.chartTitle}>{dt("appointmentsByStatus")}</Text>
            <BarChart
              data={{
                labels: statusLabels.map((label) => label.slice(0, 8)),
                datasets: [{ data: analytics.appointmentsByStatus.data }],
              }}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              showValuesOnTopOfBars
            />
          </View>

          {hasAnyValue(analytics.topServices.data) && (
            <View style={styles.chartCardFull}>
              <Text style={styles.chartTitle}>{dt("topServices")}</Text>
              <BarChart
                data={{
                  labels: analytics.topServices.labels.map((label) => label.slice(0, 10)),
                  datasets: [{ data: analytics.topServices.data }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                showValuesOnTopOfBars
              />
            </View>
          )}

          {hasAnyValue(analytics.appointmentTypeBreakdown.data) && (
            <View style={styles.chartCardFull}>
              <Text style={styles.chartTitle}>{dt("appointmentTypeBreakdown")}</Text>
              <BarChart
                data={{
                  labels: typeLabels,
                  datasets: [{ data: analytics.appointmentTypeBreakdown.data }],
                }}
                width={chartWidth}
                height={180}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                showValuesOnTopOfBars
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  row: { gap: 12, paddingBottom: 4 },
  chartCard: {
    width: chartWidth + 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chartCardFull: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chartTitle: { marginBottom: 8, fontSize: 14, fontWeight: "700", color: "#047857" },
  chart: { borderRadius: 12 },
  emptyCard: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: { color: "#64748b", textAlign: "center", lineHeight: 20 },
});
