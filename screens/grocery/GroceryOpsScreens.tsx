import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useAdjustGroceryStockMutation,
  useGetGroceryPartnerMetaQuery,
  useGetGroceryPartnerOrdersQuery,
  useGetGroceryPartnerProductsQuery,
  useGetGroceryStockHistoryQuery,
} from "../../redux/slices/groceryPartnerApi";
import { useTranslation } from "../../hooks/useTranslation";
import {
  groceryOrderStatusTranslationKey,
  partnerStatusTranslationKey,
  sellingUnitTranslationKey,
  stockReasonTranslationKey,
} from "../../utils/groceryUnits";
import PageSpinner from "../../components/ui/PageSpinner";
import { GREEN, groceryStyles, statusColor } from "./groceryUi";

type Nav = { navigate: (name: string, params?: { id?: number }) => void };

const ORDER_STATUSES = ["", "new", "accepted", "preparing", "ready", "packed", "courier_assigned", "out_for_delivery", "picked_up", "delivered", "completed", "cancelled"];

export function GroceryProductsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");
  const filters = useMemo(
    () => ({
      q: q || undefined,
      category: category || undefined,
      status: status || undefined,
      stock: stock || undefined,
    }),
    [q, category, status, stock],
  );
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerProductsQuery(filters);
  const meta = useGetGroceryPartnerMetaQuery();
  const products = data ?? [];
  const pending = !isError && (isFetching || data === undefined);

  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={groceryStyles.title}>{t("gpProducts")}</Text>
        <Pressable onPress={() => navigation.navigate("GroceryProductNew")} style={[groceryStyles.primary, { paddingHorizontal: 16 }]}>
          <Text style={groceryStyles.primaryText}>{t("gpAddProduct")}</Text>
        </Pressable>
      </View>
      <TextInput value={q} onChangeText={setQ} placeholder={t("gpSearchProducts")} style={groceryStyles.input} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t("gpFilterCategory")} on={category === ""} onPress={() => setCategory("")} />
        {(meta.data?.categories ?? []).map((item) => (
          <Chip key={item.slug} label={item.name} on={category === item.slug} onPress={() => setCategory(item.slug)} />
        ))}
      </ScrollView>
      <View style={groceryStyles.row}>
        {[
          ["", t("gpFilterStock")],
          ["in", t("gpInStock")],
          ["low", t("gpLowStock")],
          ["out", t("gpOutOfStock")],
        ].map(([value, label]) => (
          <Chip key={`stock-${value || "all"}`} label={label} on={stock === value} onPress={() => setStock(value)} />
        ))}
      </View>
      <View style={groceryStyles.row}>
        {[
          ["", t("gpFilterStatus")],
          ["active", t("gpActive")],
          ["low_stock", t("gpLowStockStatus")],
          ["out_of_stock", t("gpOutOfStock")],
          ["pending_approval", t("gpPendingApproval")],
          ["inactive", t("gpInactive")],
        ].map(([value, label]) => (
          <Chip key={`st-${value || "all"}`} label={label} on={status === value} onPress={() => setStatus(value)} />
        ))}
      </View>
      {pending ? (
        <PageSpinner />
      ) : isError ? (
        <Pressable onPress={() => void refetch()}><Text style={{ color: GREEN }}>{t("gpTryAgain")}</Text></Pressable>
      ) : products.length === 0 ? (
        <Text style={groceryStyles.muted}>{t("gpEmptyProducts")}</Text>
      ) : (
        products.map((product) => (
          <Pressable
            key={product.id}
            onPress={() => navigation.navigate("GroceryProductEdit", { id: product.id })}
            style={[groceryStyles.card, { flexDirection: "row", gap: 12 }]}
          >
            <View style={{ height: 64, width: 64, borderRadius: 12, overflow: "hidden", backgroundColor: "#F8FAF9" }}>
              {product.image ? <Image source={{ uri: product.image }} style={{ height: 64, width: 64 }} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "800" }}>{product.name}</Text>
              <Text style={groceryStyles.muted}>{product.brand || product.category_name}</Text>
              <Text style={{ fontWeight: "700", marginTop: 4 }}>
                {product.currency} {product.price_per_unit} / {t(sellingUnitTranslationKey(product.selling_unit)).toLowerCase()}
              </Text>
              <Text style={groceryStyles.muted}>
                {product.stock} {t(sellingUnitTranslationKey(product.selling_unit))} · {t(partnerStatusTranslationKey(product.partner_status))}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

export function GroceryInventoryScreen() {
  const { t } = useTranslation();
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerProductsQuery();
  const history = useGetGroceryStockHistoryQuery();
  const [adjust] = useAdjustGroceryStockMutation();
  const [busyId, setBusyId] = useState<number | null>(null);
  const products = data ?? [];
  const pending = !isError && (isFetching || data === undefined);

  async function changeStock(id: number, delta: string) {
    setBusyId(id);
    try {
      await adjust({ id, delta, reason: "manual" }).unwrap();
    } finally {
      setBusyId(null);
    }
  }

  if (pending) return <PageSpinner />;
  if (isError) {
    return (
      <Pressable onPress={() => void refetch()} style={{ padding: 24 }}>
        <Text style={{ color: GREEN }}>{t("gpTryAgain")}</Text>
      </Pressable>
    );
  }

  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpInventory")}</Text>
      {products.map((product) => (
        <View key={product.id} style={groceryStyles.card}>
          <Text style={{ fontWeight: "800" }}>{product.name}</Text>
          <Text style={groceryStyles.muted}>
            {t(sellingUnitTranslationKey(product.selling_unit))} · {product.currency} {product.price_per_unit}/
            {t(sellingUnitTranslationKey(product.selling_unit)).toLowerCase()} · {t(partnerStatusTranslationKey(product.partner_status))}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
            <Pressable
              disabled={busyId === product.id}
              onPress={() => void changeStock(product.id, product.allows_fractional ? "-0.5" : "-1")}
              style={step}
            >
              <Text>−</Text>
            </Pressable>
            <Text style={{ fontWeight: "700" }}>
              {product.stock} {t(sellingUnitTranslationKey(product.selling_unit))}
            </Text>
            <Pressable
              disabled={busyId === product.id}
              onPress={() => void changeStock(product.id, product.allows_fractional ? "0.5" : "1")}
              style={[step, { backgroundColor: GREEN }]}
            >
              <Text style={{ color: "#fff" }}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <Text style={{ fontWeight: "700", marginTop: 8 }}>{t("gpStockHistory")}</Text>
      {(history.data ?? []).length === 0 ? (
        <Text style={groceryStyles.muted}>{t("gpNoData")}</Text>
      ) : (
        (history.data ?? []).slice(0, 20).map((row) => (
          <View key={row.id} style={groceryStyles.card}>
            <Text>
              {row.product_name}: {row.previous_quantity} → {row.new_quantity} ({t(stockReasonTranslationKey(row.reason))})
            </Text>
            <Text style={groceryStyles.muted}>{new Date(row.created_at).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

export function GroceryOrdersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [status, setStatus] = useState("");
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerOrdersQuery(status || undefined);
  const orders = data ?? [];
  const pending = !isError && (isFetching || data === undefined);

  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{t("gpOrders")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {ORDER_STATUSES.map((value) => (
          <Chip
            key={value || "all"}
            label={value ? t(groceryOrderStatusTranslationKey(value)) : t("gpAll")}
            on={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </ScrollView>
      {pending ? (
        <PageSpinner />
      ) : isError ? (
        <Pressable onPress={() => void refetch()}><Text style={{ color: GREEN }}>{t("gpTryAgain")}</Text></Pressable>
      ) : orders.length === 0 ? (
        <Text style={groceryStyles.muted}>{t("gpEmptyOrders")}</Text>
      ) : (
        orders.map((order) => {
          const tone = statusColor(order.status);
          return (
            <Pressable
              key={order.id}
              onPress={() => navigation.navigate("GroceryOrderDetail", { id: order.id })}
              style={groceryStyles.card}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontWeight: "800" }}>{order.number}</Text>
                  <Text style={groceryStyles.muted}>
                    {order.customer} · {order.items} {t("gpItems").toLowerCase()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800" }}>{order.total}</Text>
                  <Text style={{ marginTop: 4, color: tone.text, fontWeight: "700", fontSize: 11 }}>
                    {t(groceryOrderStatusTranslationKey(order.status))}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[groceryStyles.chip, on ? groceryStyles.chipOn : null]}>
      <Text style={on ? groceryStyles.chipTextOn : groceryStyles.chipText}>{label}</Text>
    </Pressable>
  );
}

const step = {
  width: 36,
  height: 36,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
