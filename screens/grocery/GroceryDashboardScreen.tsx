import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useGetGroceryPartnerDashboardQuery,
  useGetGroceryPartnerNotificationsQuery,
  useGetGroceryPartnerSalesQuery,
} from "../../redux/slices/groceryPartnerApi";
import { useTranslation } from "../../hooks/useTranslation";
import { groceryOrderStatusTranslationKey } from "../../utils/groceryUnits";
import PageSpinner from "../../components/ui/PageSpinner";
import { GREEN, DARK, formatMoney, groceryStyles, statusColor } from "./groceryUi";

type Nav = {
  navigate: (name: string, params?: { id?: number }) => void;
};

export default function GroceryDashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerDashboardQuery();
  const sales = useGetGroceryPartnerSalesQuery("7d");
  const notes = useGetGroceryPartnerNotificationsQuery();

  if (!isError && (isFetching || !data)) return <PageSpinner />;
  if (isError || !data) {
    return (
      <Pressable onPress={() => void refetch()} style={{ padding: 24 }}>
        <Text>{t("gpLoadError")}</Text>
        <Text style={{ color: GREEN, marginTop: 8 }}>{t("gpTryAgain")}</Text>
      </Pressable>
    );
  }

  const currency = data.low_stock_products?.[0]?.currency || "ZAR";
  const money = (n: number) => formatMoney(n, currency);
  const kpis = [
    {
      label: t("gpTodaySales"),
      value: money(data.kpis.today_sales),
      change: data.kpis.today_sales_change,
      vs: t("gpVsYesterday"),
    },
    {
      label: t("gpOrdersToday"),
      value: String(data.kpis.orders_today),
      change: data.kpis.orders_today_change,
      vs: t("gpVsYesterday"),
    },
    { label: t("gpProductsCount"), value: String(data.kpis.products) },
    { label: t("gpLowStock"), value: String(data.kpis.low_stock) },
    { label: t("gpPendingOrders"), value: String(data.kpis.pending_orders) },
    {
      label: t("gpRevenueKpi"),
      value: money(data.kpis.revenue),
      change: data.kpis.revenue_change,
      vs: t("gpVsLastMonth"),
    },
  ];
  const maxSale = Math.max(...(sales.data?.sales ?? [1]), 1);

  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={groceryStyles.title}>
            {t("gpGreeting").replace("{name}", data.greeting_name)}
          </Text>
          <Text style={groceryStyles.subtitle}>{t("gpGreetingSub")}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("GroceryNotifications")} style={{ padding: 8 }}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          {notes.data && notes.data.count > 0 ? (
            <View
              style={{
                position: "absolute",
                right: 2,
                top: 2,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: GREEN,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>{notes.data.count}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={groceryStyles.row}>
        <Pressable
          onPress={() => navigation.navigate("GroceryProductNew")}
          style={[groceryStyles.primary, { width: "48%" }]}
        >
          <Text style={groceryStyles.primaryText}>{t("gpAddProduct")}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("GroceryOrders")}
          style={[groceryStyles.secondary, { width: "48%" }]}
        >
          <Text style={groceryStyles.secondaryText}>{t("gpViewOrders")}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("GroceryInventory")}
          style={[groceryStyles.secondary, { width: "48%" }]}
        >
          <Text style={groceryStyles.secondaryText}>{t("gpUpdateInventory")}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("GroceryPromotions")}
          style={[groceryStyles.secondary, { width: "48%" }]}
        >
          <Text style={groceryStyles.secondaryText}>{t("gpCreatePromotion")}</Text>
        </Pressable>
      </View>

      <View style={groceryStyles.row}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={groceryStyles.kpi}>
            <Text style={groceryStyles.kpiLabel}>{kpi.label}</Text>
            <Text style={groceryStyles.kpiValue}>{kpi.value}</Text>
            {kpi.change !== undefined ? (
              <Text style={[groceryStyles.kpiChange, { color: (kpi.change ?? 0) >= 0 ? GREEN : "#DC2626" }]}>
                {(kpi.change ?? 0) >= 0 ? "+" : ""}
                {kpi.change}% {kpi.vs}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      {sales.data ? (
        <View style={groceryStyles.card}>
          <Text style={{ fontWeight: "700", marginBottom: 12 }}>{t("gpSales")}</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", height: 120, gap: 4 }}>
            {sales.data.sales.map((value, index) => (
              <View
                key={sales.data?.labels[index] ?? index}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(11,143,69,0.8)",
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  height: Math.max(8, (value / maxSale) * 112),
                }}
              />
            ))}
          </View>
          <View style={[groceryStyles.row, { marginTop: 12 }]}>
            <Stat label={t("gpTodaySales")} value={money(sales.data.total_sales)} />
            <Stat label={t("gpOrders")} value={String(sales.data.order_count)} />
            <Stat label={t("gpAvgOrder")} value={money(sales.data.average_order_value)} />
            <Stat label={t("gpCompletedOrders")} value={String(sales.data.completed_orders)} />
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontWeight: "700" }}>{t("gpRecentOrders")}</Text>
        <Pressable onPress={() => navigation.navigate("GroceryOrders")}>
          <Text style={{ color: GREEN, fontWeight: "600" }}>{t("gpViewAllOrders")}</Text>
        </Pressable>
      </View>
      {data.recent_orders.length === 0 ? (
        <Text style={groceryStyles.muted}>{t("gpEmptyOrders")}</Text>
      ) : (
        data.recent_orders.map((order) => {
          const tone = statusColor(order.status);
          return (
            <Pressable
              key={order.id}
              onPress={() => navigation.navigate("GroceryOrderDetail", { id: order.id })}
              style={groceryStyles.card}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <View>
                  <Text style={{ fontWeight: "700", color: DARK }}>{order.number}</Text>
                  <Text style={groceryStyles.muted}>
                    {order.customer} · {order.items} {t("gpItems").toLowerCase()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800" }}>{money(order.total)}</Text>
                  <Text
                    style={{
                      marginTop: 4,
                      backgroundColor: tone.bg,
                      color: tone.text,
                      fontSize: 11,
                      fontWeight: "700",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    {t(groceryOrderStatusTranslationKey(order.status))}
                  </Text>
                  {order.payment_status ? (
                    <Text style={[groceryStyles.muted, { fontSize: 11, textTransform: "capitalize", marginTop: 2 }]}>
                      {order.payment_status}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: "48%" }}>
      <Text style={groceryStyles.kpiLabel}>{label}</Text>
      <Text style={{ fontWeight: "700" }}>{value}</Text>
    </View>
  );
}
