import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  useCreateGroceryPartnerProductMutation,
  useGetGroceryPartnerMetaQuery,
  useGetGroceryPartnerProductQuery,
  useUpdateGroceryPartnerProductMutation,
} from "../../redux/slices/groceryPartnerApi";
import { useTranslation } from "../../hooks/useTranslation";
import { sellingUnitTranslationKey } from "../../utils/groceryUnits";
import { appendFormDataFile } from "../../utils/formDataFile";
import PageSpinner from "../../components/ui/PageSpinner";
import { groceryStyles } from "./groceryUi";

type Nav = { goBack: () => void };
type PickedImage = { uri: string; name: string; type: string };

export default function GroceryProductFormScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const productId = (route.params as { id?: number } | undefined)?.id ?? null;
  const existing = useGetGroceryPartnerProductQuery(productId ?? 0, { skip: !productId });
  const meta = useGetGroceryPartnerMetaQuery();
  const [createProduct, createState] = useCreateGroceryPartnerProductMutation();
  const [updateProduct, updateState] = useUpdateGroceryPartnerProductMutation();
  const product = existing.data;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("fresh-produce");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sellingUnit, setSellingUnit] = useState("item");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("");
  const [threshold, setThreshold] = useState("10");
  const [file, setFile] = useState<PickedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category_slug || "fresh-produce");
    setSubcategory(product.subcategory);
    setBrand(product.brand);
    setSellingUnit(product.selling_unit);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setWeight(product.weight ? String(product.weight) : "");
    setWeightUnit(product.weight_unit);
    setThreshold(String(product.low_stock_threshold));
  }, [product]);

  const selectedCategory = useMemo(
    () => (meta.data?.categories ?? []).find((item) => item.slug === category),
    [meta.data, category],
  );

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || "image/jpeg";
    const ext = mime.includes("png") ? "png" : "jpg";
    setFile({ uri: asset.uri, name: asset.fileName || `product.${ext}`, type: mime });
  }

  async function onSave() {
    setError(null);
    const body = new FormData();
    body.append("name", name);
    body.append("description", description);
    body.append("category", selectedCategory?.name || category);
    body.append("subcategory", subcategory);
    body.append("brand", brand);
    body.append("selling_unit", sellingUnit);
    body.append("price", price);
    body.append("stock", stock);
    body.append("low_stock_threshold", threshold);
    if (weight) body.append("weight", weight);
    if (weightUnit) body.append("weight_unit", weightUnit);
    if (file) {
      await appendFormDataFile(body, "image", file);
    }
    try {
      if (productId) {
        await updateProduct({ id: productId, body }).unwrap();
      } else {
        await createProduct(body).unwrap();
      }
      navigation.goBack();
    } catch {
      setError(t("gpLoadError"));
    }
  }

  if (productId && (existing.isFetching || existing.isLoading)) {
    return <PageSpinner />;
  }

  const preview = file?.uri || product?.image;
  const saving = createState.isLoading || updateState.isLoading;

  return (
    <ScrollView style={groceryStyles.screen} contentContainerStyle={groceryStyles.content}>
      <Text style={groceryStyles.title}>{productId ? t("gpProducts") : t("gpAddProduct")}</Text>

      <View style={groceryStyles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>{t("gpBasicInfo")}</Text>
        <Text style={groceryStyles.muted}>{t("gpProductName")}</Text>
        <TextInput value={name} onChangeText={setName} placeholder={t("gpProductName")} style={groceryStyles.input} />
        <Text style={groceryStyles.muted}>{t("gpDescription")}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t("gpDescription")}
          multiline
          style={[groceryStyles.input, { minHeight: 80, textAlignVertical: "top" }]}
        />
        <Text style={groceryStyles.muted}>{t("gpCategory")}</Text>
        <View style={groceryStyles.row}>
          {(meta.data?.categories ?? []).map((item) => (
            <Pressable
              key={item.slug}
              onPress={() => {
                setCategory(item.slug);
                setSubcategory("");
              }}
              style={[groceryStyles.chip, category === item.slug && groceryStyles.chipOn]}
            >
              <Text style={category === item.slug ? groceryStyles.chipTextOn : groceryStyles.chipText}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={groceryStyles.muted}>{t("gpSubcategory")}</Text>
        <View style={groceryStyles.row}>
          <Pressable
            onPress={() => setSubcategory("")}
            style={[groceryStyles.chip, subcategory === "" && groceryStyles.chipOn]}
          >
            <Text style={subcategory === "" ? groceryStyles.chipTextOn : groceryStyles.chipText}>{t("gpAll")}</Text>
          </Pressable>
          {(selectedCategory?.subcategories ?? []).map((item) => (
            <Pressable
              key={item}
              onPress={() => setSubcategory(item)}
              style={[groceryStyles.chip, subcategory === item && groceryStyles.chipOn]}
            >
              <Text style={subcategory === item ? groceryStyles.chipTextOn : groceryStyles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={groceryStyles.muted}>{t("gpBrand")}</Text>
        <TextInput value={brand} onChangeText={setBrand} placeholder={t("gpBrand")} style={groceryStyles.input} />
      </View>

      <View style={groceryStyles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>{t("gpImages")}</Text>
        {preview ? <Image source={{ uri: preview }} style={{ height: 120, width: 120, borderRadius: 12 }} /> : null}
        <Pressable onPress={() => void pickImage()} style={groceryStyles.secondary}>
          <Text style={groceryStyles.secondaryText}>{t("gpImages")}</Text>
        </Pressable>
      </View>

      <View style={groceryStyles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>{t("gpPricingUnit")}</Text>
        <Text style={groceryStyles.muted}>{t("gpSoldBy")}</Text>
        <View style={groceryStyles.row}>
          {(meta.data?.selling_units ?? []).map((unit) => (
            <Pressable
              key={unit.value}
              onPress={() => setSellingUnit(unit.value)}
              style={[groceryStyles.chip, sellingUnit === unit.value && groceryStyles.chipOn]}
            >
              <Text style={sellingUnit === unit.value ? groceryStyles.chipTextOn : groceryStyles.chipText}>
                {t(sellingUnitTranslationKey(unit.value))}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={groceryStyles.muted}>
          {t("gpPricePer")} ({t(sellingUnitTranslationKey(sellingUnit)).toLowerCase()})
        </Text>
        <TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={groceryStyles.input} />
        <Text style={groceryStyles.muted}>{t("gpAvailableQty")}</Text>
        <TextInput value={stock} onChangeText={setStock} keyboardType="decimal-pad" style={groceryStyles.input} />
        <Text style={groceryStyles.muted}>{t("gpLowStockThreshold")}</Text>
        <TextInput value={threshold} onChangeText={setThreshold} keyboardType="decimal-pad" style={groceryStyles.input} />
        <Text style={groceryStyles.muted}>{t("gpWeight")}</Text>
        <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" style={groceryStyles.input} />
        <Text style={groceryStyles.muted}>{t("gpWeightUnit")}</Text>
        <View style={groceryStyles.row}>
          <Pressable
            onPress={() => setWeightUnit("")}
            style={[groceryStyles.chip, weightUnit === "" && groceryStyles.chipOn]}
          >
            <Text style={weightUnit === "" ? groceryStyles.chipTextOn : groceryStyles.chipText}>{t("gpAll")}</Text>
          </Pressable>
          {(meta.data?.weight_units ?? []).map((unit) => (
            <Pressable
              key={unit.value}
              onPress={() => setWeightUnit(unit.value)}
              style={[groceryStyles.chip, weightUnit === unit.value && groceryStyles.chipOn]}
            >
              <Text style={weightUnit === unit.value ? groceryStyles.chipTextOn : groceryStyles.chipText}>
                {t(sellingUnitTranslationKey(unit.value))}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}
      <Pressable
        disabled={saving}
        onPress={() => void onSave()}
        style={[groceryStyles.primary, saving ? { opacity: 0.6 } : null]}
      >
        <Text style={groceryStyles.primaryText}>{t("gpSaveProduct")}</Text>
      </Pressable>
    </ScrollView>
  );
}
