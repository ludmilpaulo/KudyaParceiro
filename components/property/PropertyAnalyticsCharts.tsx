import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import type { AnalyticsDays } from "../analytics/AnalyticsDaysFilter";
import AnalyticsDaysFilter from "../analytics/AnalyticsDaysFilter";
import AnalyticsComparisonStrip from "../analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "../analytics/AnalyticsExportButtons";
import type { PropertyDashboardAnalytics } from "../../types/property";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import { formatPercentChange } from "../../utils/analyticsExport";

const screenWidth = Dimensions.get("window").width;
const chartWidth = Math.min(screenWidth - 48, 420);

type Props = {
  analytics: PropertyDashboardAnalytics;
  days: AnalyticsDays;
  onDaysChange: (days: AnalyticsDays) => void;
};

function hasAnyValue(data: number[]): boolean {
  return data.some((value) => value > 0);
}

const PIE_COLORS = ["#0f766e", "#14b8a6", "#5eead4", "#115e59", "#99f6e4"];

function toPieChartData(labels: string[], data: number[]) {
  return labels.map((label, index) => ({
    name: label,
    population: data[index] ?? 0,
    color: PIE_COLORS[index % PIE_COLORS.length],
    legendFontColor: "#64748b",
    legendFontSize: 12,
  }));
}

export default function PropertyAnalyticsCharts({ analytics, days, onDaysChange }: Props) {
  const { pt, listingTypeLabel, enquiryStatusLabel, approvalStatusLabel } = usePropertyTranslation();

  const daysLabel = (value: AnalyticsDays) => {
    if (value === 30) return pt("days30");
    if (value === 90) return pt("days90");
    return pt("last7Days");
  };

  const exportPayload = useMemo(
    () => ({
      title: pt("analyticsTitle"),
      subtitle: daysLabel(days),
      sections: [
        {
          title: pt("comparisonTitle"),
          rows: [
            {
              label: pt("enquiriesMetric"),
              value: `${analytics.comparison.enquiries.current} (${formatPercentChange(analytics.comparison.enquiries.percentChange)})`,
            },
            {
              label: pt("listingsCreated"),
              value: `${analytics.comparison.listingsCreated.current} (${formatPercentChange(analytics.comparison.listingsCreated.percentChange)})`,
            },
          ],
        },
      ],
    }),
    [analytics, days, pt],
  );

  const hasData = useMemo(
    () =>
      [
        analytics.enquiriesByDay.data,
        analytics.listingsByType.data,
        analytics.enquiriesByStatus.data,
        analytics.listingsByApproval.data,
        analytics.topListingsByEnquiries.data,
      ].some(hasAnyValue),
    [analytics],
  );

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#f0fdfa",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
    labelColor: () => "#64748b",
    propsForBackgroundLines: { stroke: "#e2e8f0" },
    barPercentage: 0.55,
  };

  const dayLabels = analytics.enquiriesByDay.labels.map((label) => label.slice(5));
  const listingTypeLabels = analytics.listingsByType.labels.map((label) => listingTypeLabel(label));
  const enquiryStatusLabels = analytics.enquiriesByStatus.labels.map((label) =>
    enquiryStatusLabel(label),
  );
  const approvalLabels = analytics.listingsByApproval.labels.map((label) =>
    approvalStatusLabel(label),
  );

  const listingsByTypePie = toPieChartData(listingTypeLabels, analytics.listingsByType.data).filter(
    (item) => item.population > 0,
  );
  const listingsByApprovalPie = toPieChartData(approvalLabels, analytics.listingsByApproval.data).filter(
    (item) => item.population > 0,
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>{pt("analyticsTitle")}</Text>
      <AnalyticsDaysFilter value={days} onChange={onDaysChange} labelFor={daysLabel} />
      <View style={{ marginBottom: 10 }}>
        <AnalyticsExportButtons
          payload={exportPayload}
          exportCsvLabel={pt("exportCsv")}
          exportPdfLabel={pt("exportPdf")}
        />
      </View>
      <AnalyticsComparisonStrip
        title={pt("comparisonTitle")}
        vsPreviousLabel={pt("vsPreviousPeriod")}
        cards={[
          {
            key: "enquiries",
            label: pt("enquiriesMetric"),
            comparison: analytics.comparison.enquiries,
          },
          {
            key: "listings",
            label: pt("listingsCreated"),
            comparison: analytics.comparison.listingsCreated,
          },
        ]}
      />

      {!hasData ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{pt("noAnalyticsData")}</Text>
        </View>
      ) : (
        <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{pt("enquiriesTrend")}</Text>
          <LineChart
            data={{
              labels: dayLabels,
              datasets: [{ data: analytics.enquiriesByDay.data.length ? analytics.enquiriesByDay.data : [0] }],
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
          <Text style={styles.chartTitle}>{pt("listingsByType")}</Text>
          {listingsByTypePie.length > 0 ? (
            <PieChart
              data={listingsByTypePie}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="12"
              style={styles.chart}
            />
          ) : (
            <Text style={styles.emptyChart}>{pt("noAnalyticsData")}</Text>
          )}
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{pt("enquiriesByStatus")}</Text>
          {hasAnyValue(analytics.enquiriesByStatus.data) ? (
            <BarChart
              data={{
                labels: enquiryStatusLabels.map((label) => label.slice(0, 8)),
                datasets: [{ data: analytics.enquiriesByStatus.data.length ? analytics.enquiriesByStatus.data : [0] }],
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
          ) : (
            <Text style={styles.emptyChart}>{pt("noAnalyticsData")}</Text>
          )}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{pt("listingsByApproval")}</Text>
          {listingsByApprovalPie.length > 0 ? (
            <PieChart
              data={listingsByApprovalPie}
              width={chartWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(13, 148, 136, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="12"
              style={styles.chart}
            />
          ) : (
            <Text style={styles.emptyChart}>{pt("noAnalyticsData")}</Text>
          )}
        </View>
      </ScrollView>

      {hasAnyValue(analytics.topListingsByEnquiries.data) && (
        <View style={styles.chartCardFull}>
          <Text style={styles.chartTitle}>{pt("topListingsByEnquiries")}</Text>
          <BarChart
            data={{
              labels: analytics.topListingsByEnquiries.labels.map((label) => label.slice(0, 12)),
              datasets: [{ data: analytics.topListingsByEnquiries.data }],
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  sectionHint: { marginTop: 2, marginBottom: 10, fontSize: 12, color: "#64748b" },
  row: { gap: 12, paddingBottom: 4 },
  chartCard: {
    width: chartWidth + 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chartTitle: { marginBottom: 8, fontSize: 14, fontWeight: "700", color: "#0f766e" },
  chartCardFull: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
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
  emptyChart: { minHeight: 120, textAlign: "center", color: "#94a3b8", paddingTop: 48 },
});
