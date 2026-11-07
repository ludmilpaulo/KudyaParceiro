import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import {
  useCreateGroceryPartnerPromotionMutation,
  useGetGroceryPartnerAnalyticsQuery,
  useGetGroceryPartnerCustomersQuery,
  useGetGroceryPartnerMetaQuery,
  useGetGroceryPartnerNotificationsQuery,
  useGetGroceryPartnerOrderQuery,
  useGetGroceryPartnerProductsQuery,
  useGetGroceryPartnerPromotionsQuery,
  useGetGroceryPartnerRevenueQuery,
  useGetGroceryPartnerReviewsQuery,
  useGetGroceryPartnerSalesQuery,
  useGetGroceryPartnerSettingsQuery,
  usePickGroceryOrderLineMutation,
  useSubstituteGroceryOrderLineMutation,
  useUpdateGroceryPartnerOrderStatusMutation,
  useUpdateGroceryPartnerSettingsMutation,
} from "../../redux/slices/groceryPartnerApi";
import { logoutUser } from "../../redux/slices/authSlice";
import { useTranslation } from "../../hooks/useTranslation";
import { sellingUnitTranslationKey } from "../../utils/groceryUnits";
import PageSpinner from "../../components/ui/PageSpinner";
import { GREEN, groceryStyles } from "./groceryUi";

type Nav = { navigate: (name: string, params?: { id?: number }) => void; goBack: () => void };

const NEXT: Record<string, { status: string; key: string }> = {
  new: { status: "accepted", key: "gpAcceptOrder" },
  accepted: { status: "preparing", key: "gpStartPreparing" },
  preparing: { status: "ready", key: "gpReadyPickup" },
  ready: { status: "picked_up", key: "gpHandToDriver" },
};

export function GroceryOrderDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const orderId = (route.params as { id: number } | undefined)?.id ?? 0;
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerOrderQuery(orderId);
  const products = useGetGroceryPartnerProductsQuery();
  const [advance] = useUpdateGroceryPartnerOrderStatusMutation();
  const [pick] = usePickGroceryOrderLineMutation();
  const [substitute] = useSubstituteGroceryOrderLineMutation();
  const [subLine, setSubLine] = useState<number | null>(null);
  const [subProduct, setSubProduct] = useState("");
  if (!isError && (isFetching || !data)) return <PageSpinner />;
  if (isError || !data) {
    return (
      <Pressable onPress={() => void refetch()} style={{ padding: 24 }}>
        <Text style={{ color: GREEN }}>{t("gpTryAgain")}</Text>
      </Pressable>
    );
  }
  const next = NEXT[data.status];
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{data.number}</Text>
      <Text style={groceryStyles.muted}>{data.customer}</Text>
      {data.status === "new" ? (
        <Pressable onPress={() => void advance({ id: data.id, status: "cancelled" })} style={groceryStyles.secondary}>
          <Text>{t("gpRejectOrder")}</Text>
        </Pressable>
      ) : null}
      {next ? (
        <Pressable onPress={() => void advance({ id: data.id, status: next.status })} style={groceryStyles.primary}>
          <Text style={groceryStyles.primaryText}>{t(next.key)}</Text>
        </Pressable>
      ) : null}
      <Text style={{ fontWeight: "700" }}>{t("gpItems")}</Text>
      {data.lines.map((line) => (
        <View key={line.id} style={groceryStyles.card}>
          <Text style={{ fontWeight: "700" }}>
            {line.name} — {line.quantity} {t(sellingUnitTranslationKey(line.selling_unit))}
          </Text>
          <Text style={groceryStyles.muted}>
            {line.unit_price}/{t(sellingUnitTranslationKey(line.selling_unit)).toLowerCase()} · {line.sub_total}
            {line.substituted_product_name ? ` · ${t("gpSubstituted")}: ${line.substituted_product_name}` : ""}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <Pressable
              onPress={() => void pick({ id: data.id, line_id: line.id, pick_status: "found" })}
              style={[groceryStyles.chip, line.pick_status === "found" && groceryStyles.chipOn]}
            >
              <Text style={line.pick_status === "found" ? groceryStyles.chipTextOn : groceryStyles.chipText}>{t("gpFound")}</Text>
            </Pressable>
            <Pressable
              onPress={() => void pick({ id: data.id, line_id: line.id, pick_status: "missing" })}
              style={[groceryStyles.chip, line.pick_status === "missing" && groceryStyles.chipOn]}
            >
              <Text style={line.pick_status === "missing" ? groceryStyles.chipTextOn : groceryStyles.chipText}>{t("gpMissing")}</Text>
            </Pressable>
            <Pressable onPress={() => setSubLine(line.id)} style={groceryStyles.chip}>
              <Text style={groceryStyles.chipText}>{t("gpSubstitute")}</Text>
            </Pressable>
          </View>
          {subLine === line.id ? (
            <View style={{ marginTop: 8, gap: 8 }}>
              {(products.data ?? [])
                .filter((item) => item.id !== line.product_id)
                .map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSubProduct(String(item.id))}
                    style={[groceryStyles.chip, subProduct === String(item.id) && groceryStyles.chipOn]}
                  >
                    <Text style={subProduct === String(item.id) ? groceryStyles.chipTextOn : groceryStyles.chipText}>{item.name}</Text>
                  </Pressable>
                ))}
              <Pressable
                disabled={!subProduct}
                onPress={() => {
                  void substitute({ id: data.id, line_id: line.id, substitute_product_id: Number(subProduct) });
                  setSubLine(null);
                }}
                style={groceryStyles.primary}
              >
                <Text style={groceryStyles.primaryText}>{t("gpSaved")}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

export function GroceryMoreScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const groups: Array<{ title: string; items: Array<[string, string]> }> = [
    {
      title: t("gpMain"),
      items: [
        ["GroceryCategories", "gpCategories"],
        ["GroceryPromotions", "gpPromotions"],
        ["GroceryCustomers", "gpCustomers"],
        ["GroceryReviews", "gpReviews"],
      ],
    },
    {
      title: t("gpBusiness"),
      items: [
        ["GrocerySales", "gpSales"],
        ["GroceryRevenue", "gpRevenue"],
        ["GroceryPayouts", "gpPayouts"],
        ["GroceryAnalytics", "gpAnalytics"],
      ],
    },
    {
      title: t("gpStore"),
      items: [
        ["GroceryStore", "gpStoreProfile"],
        ["GroceryHours", "gpOpeningHours"],
        ["GroceryDelivery", "gpDeliverySettings"],
        ["GroceryStaff", "gpStaff"],
        ["GrocerySettings", "gpSettings"],
      ],
    },
  ];
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpMore")}</Text>
      {groups.map((group) => (
        <View key={group.title} style={{ gap: 8 }}>
          <Text style={groceryStyles.group}>{group.title}</Text>
          {group.items.map(([screen, key]) => (
            <Pressable key={screen} onPress={() => navigation.navigate(screen)} style={groceryStyles.card}>
              <Text style={{ fontWeight: "700" }}>{t(key)}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <Pressable onPress={() => navigation.navigate("GroceryHelp")} style={groceryStyles.card}>
        <Text style={{ fontWeight: "700" }}>{t("gpHelp")}</Text>
      </Pressable>
      <Pressable onPress={() => dispatch(logoutUser())} style={groceryStyles.secondary}>
        <Text style={{ color: "#B91C1C", fontWeight: "700" }}>{t("gpLogout")}</Text>
      </Pressable>
    </ScrollView>
  );
}

export function GrocerySalesScreen() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("7d");
  const { data, isFetching } = useGetGroceryPartnerSalesQuery(period);
  const periods: Array<[string, string]> = [
    ["today", "gpToday"],
    ["7d", "gp7Days"],
    ["30d", "gp30Days"],
    ["90d", "gp3Months"],
    ["365d", "gp12Months"],
  ];
  if (isFetching || !data) {
    return (
      <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
        <Text style={groceryStyles.title}>{t("gpSales")}</Text>
        <PageSpinner />
      </ScrollView>
    );
  }
  const max = Math.max(...data.sales, 1);
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpSales")}</Text>
      <View style={groceryStyles.row}>
        {periods.map(([value, key]) => (
          <Pressable key={value} onPress={() => setPeriod(value)} style={[groceryStyles.chip, period === value && groceryStyles.chipOn]}>
            <Text style={period === value ? groceryStyles.chipTextOn : groceryStyles.chipText}>{t(key)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={groceryStyles.card}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 140, gap: 4 }}>
          {data.sales.map((value, index) => (
            <View
              key={data.labels[index] ?? index}
              style={{
                flex: 1,
                backgroundColor: GREEN,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                height: Math.max(6, (value / max) * 130),
              }}
            />
          ))}
        </View>
        <Text style={{ marginTop: 12 }}>{t("gpTodaySales")}: {data.total_sales}</Text>
        <Text>{t("gpOrders")}: {data.order_count}</Text>
        <Text>{t("gpAvgOrder")}: {data.average_order_value}</Text>
        <Text>{t("gpCompletedOrders")}: {data.completed_orders}</Text>
      </View>
    </ScrollView>
  );
}

export function GroceryRevenueScreen() {
  return <GroceryRevenueBody titleKey="gpRevenue" />;
}

function GroceryRevenueBody({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("month");
  const { data, isFetching } = useGetGroceryPartnerRevenueQuery(period);
  if (isFetching || !data) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t(titleKey)}</Text>
      <View style={groceryStyles.row}>
        {["today", "week", "month"].map((value) => (
          <Pressable key={value} onPress={() => setPeriod(value)} style={[groceryStyles.chip, period === value && groceryStyles.chipOn]}>
            <Text style={period === value ? groceryStyles.chipTextOn : groceryStyles.chipText}>{value}</Text>
          </Pressable>
        ))}
      </View>
      {[
        [t("gpGrossSales"), data.gross_sales],
        [t("gpCommission"), data.kudya_commission],
        [t("gpDeliveryCharges"), data.delivery_charges],
        [t("gpDiscounts"), data.discounts],
        [t("gpRefunds"), data.refunds],
        [t("gpNetEarnings"), data.net_earnings],
        [t("gpPendingPayout"), data.pending_payout],
        [t("gpPaidOut"), data.paid_out],
      ].map(([label, value]) => (
        <View key={String(label)} style={groceryStyles.card}>
          <Text style={groceryStyles.muted}>{label}</Text>
          <Text style={{ fontSize: 20, fontWeight: "800" }}>{value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function GroceryPayoutsScreen() {
  return <GroceryRevenueBody titleKey="gpPayouts" />;
}

export function GroceryAnalyticsScreen() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerAnalyticsQuery();
  if (isFetching || !data) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpAnalytics")}</Text>
      <View style={groceryStyles.card}><Text style={groceryStyles.muted}>{t("gpSales")}</Text><Text style={{ fontWeight: "800" }}>{data.sales}</Text></View>
      <View style={groceryStyles.card}><Text style={groceryStyles.muted}>{t("gpOrders")}</Text><Text style={{ fontWeight: "800" }}>{data.orders}</Text></View>
      <View style={groceryStyles.card}><Text style={groceryStyles.muted}>{t("gpAvgOrder")}</Text><Text style={{ fontWeight: "800" }}>{data.average_order_value}</Text></View>
      <View style={groceryStyles.card}><Text style={groceryStyles.muted}>{t("gpCustomers")}</Text><Text style={{ fontWeight: "800" }}>{data.customer_repeat_rate}</Text></View>
      <Text style={{ fontWeight: "700" }}>{t("gpBestSellers")}</Text>
      {data.best_selling.map((item, index) => (
        <Text key={item.id}>{index + 1}. {item.name} — {item.sold}</Text>
      ))}
    </ScrollView>
  );
}

export function GroceryPromotionsScreen() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerPromotionsQuery();
  const products = useGetGroceryPartnerProductsQuery();
  const [createPromo] = useCreateGroceryPartnerPromotionMutation();
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [value, setValue] = useState("");
  const [productId, setProductId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpPromotions")}</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder={t("gpCreatePromotion")} style={groceryStyles.input} />
      <View style={groceryStyles.row}>
        {(
          [
            ["percent", "%"],
            ["fixed", "Fixed"],
            ["bogo", "BOGO"],
            ["multi", "Multi-buy"],
            ["weekly", "Weekly"],
          ] as const
        ).map(([kind, label]) => (
          <Pressable key={kind} onPress={() => setDiscountType(kind)} style={[groceryStyles.chip, discountType === kind && groceryStyles.chipOn]}>
            <Text style={discountType === kind ? groceryStyles.chipTextOn : groceryStyles.chipText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput value={value} onChangeText={setValue} placeholder={t("gpPricePer")} keyboardType="decimal-pad" style={groceryStyles.input} />
      <View style={groceryStyles.row}>
        <Pressable onPress={() => setProductId("")} style={[groceryStyles.chip, productId === "" && groceryStyles.chipOn]}>
          <Text style={productId === "" ? groceryStyles.chipTextOn : groceryStyles.chipText}>{t("gpAll")}</Text>
        </Pressable>
        {(products.data ?? []).map((item) => (
          <Pressable key={item.id} onPress={() => setProductId(String(item.id))} style={[groceryStyles.chip, productId === String(item.id) && groceryStyles.chipOn]}>
            <Text style={productId === String(item.id) ? groceryStyles.chipTextOn : groceryStyles.chipText}>{item.name}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput value={start} onChangeText={setStart} placeholder="YYYY-MM-DDTHH:mm" style={groceryStyles.input} />
      <TextInput value={end} onChangeText={setEnd} placeholder="YYYY-MM-DDTHH:mm" style={groceryStyles.input} />
      <Pressable
        onPress={() => {
          void createPromo({
            title,
            discount_type: discountType,
            discount_value: value,
            product: productId ? Number(productId) : null,
            start_at: start,
            end_at: end,
            is_active: true,
          }).then(() => {
            setTitle("");
            setValue("");
          });
        }}
        style={groceryStyles.primary}
      >
        <Text style={groceryStyles.primaryText}>{t("gpCreatePromotion")}</Text>
      </Pressable>
      {isFetching || data === undefined ? (
        <PageSpinner />
      ) : (
        (data ?? []).map((promo) => (
          <View key={promo.id} style={groceryStyles.card}>
            <Text style={{ fontWeight: "700" }}>{promo.title}</Text>
            <Text style={groceryStyles.muted}>
              {promo.discount_type} {promo.discount_value} · {promo.product_name || t("gpAll")}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

export function GroceryCategoriesScreen() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerMetaQuery();
  if (isFetching || !data) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpCategories")}</Text>
      {data.categories.map((category) => (
        <View key={category.slug} style={groceryStyles.card}>
          <Text style={{ fontWeight: "700" }}>{category.name}</Text>
          <Text style={groceryStyles.muted}>{category.subcategories.join(", ")}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function GroceryCustomersScreen() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerCustomersQuery();
  if (isFetching || data === undefined) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpCustomers")}</Text>
      {data.length === 0 ? <Text style={groceryStyles.muted}>{t("gpNoData")}</Text> : data.map((row) => (
        <View key={row.id} style={groceryStyles.card}>
          <Text style={{ fontWeight: "700" }}>{row.name || row.phone}</Text>
          <Text style={groceryStyles.muted}>{row.orders} {t("gpOrders").toLowerCase()} · {row.spent}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function GroceryReviewsScreen() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerReviewsQuery();
  if (isFetching || data === undefined) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpReviews")}</Text>
      {data.length === 0 ? <Text style={groceryStyles.muted}>{t("gpNoData")}</Text> : data.map((row) => (
        <View key={row.id} style={groceryStyles.card}>
          <Text style={{ fontWeight: "700" }}>{row.product_name} · {row.rating}/5</Text>
          <Text style={groceryStyles.muted}>{row.comment}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function GrocerySettingsScreen() {
  return <GrocerySettingsBody titleKey="gpSettings" />;
}

function GrocerySettingsBody({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerSettingsQuery();
  const [save] = useUpdateGroceryPartnerSettingsMutation();
  if (isFetching || !data) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t(titleKey)}</Text>
      <Pressable onPress={() => void save({ accepting_orders: !data.accepting_orders })} style={groceryStyles.primary}>
        <Text style={groceryStyles.primaryText}>
          {data.accepting_orders ? t("gpAcceptingOrders") : t("gpStoreUnavailable")}
        </Text>
      </Pressable>
      <View style={groceryStyles.card}>
        <Text style={{ fontWeight: "700" }}>{data.store_name}</Text>
        <Text style={groceryStyles.muted}>{data.address}</Text>
        <Text style={groceryStyles.muted}>{data.phone}</Text>
        <Text style={{ color: GREEN, marginTop: 8 }}>{t("gpViewAsCustomer")}</Text>
      </View>
    </ScrollView>
  );
}

export function GroceryStoreScreen() {
  return <GrocerySettingsBody titleKey="gpStoreProfile" />;
}

export function GroceryHoursScreen() {
  return <GrocerySettingsBody titleKey="gpOpeningHours" />;
}

export function GroceryDeliveryScreen() {
  return <GrocerySettingsBody titleKey="gpDeliverySettings" />;
}

export function GroceryStaffScreen() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerSettingsQuery();
  if (isFetching || !data) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpStaff")}</Text>
      <View style={groceryStyles.card}>
        <Text style={{ fontWeight: "700" }}>{data.store_name}</Text>
        <Text style={groceryStyles.muted}>{data.phone}</Text>
      </View>
    </ScrollView>
  );
}

export function GroceryHelpScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpHelp")}</Text>
      <View style={groceryStyles.card}>
        <Text style={groceryStyles.muted}>{t("gpGreetingSub")}</Text>
      </View>
    </ScrollView>
  );
}

export function GroceryNotificationsScreen() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPartnerNotificationsQuery();
  if (isFetching || !data) return <PageSpinner />;
  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpNotifications")}</Text>
      {data.results.length === 0 ? (
        <Text style={groceryStyles.muted}>{t("gpNoData")}</Text>
      ) : (
        data.results.map((note) => (
          <View key={note.id} style={groceryStyles.card}>
            <Text style={{ fontWeight: "700" }}>{note.title}</Text>
            <Text style={groceryStyles.muted}>{new Date(note.created_at).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
