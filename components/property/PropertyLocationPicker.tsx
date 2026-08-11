import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, type Region } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  fetchCities,
  fetchCountries,
  fetchDistricts,
  fetchRegions,
  forwardGeocode,
  reverseGeocode,
  type GeocodeResult,
  type LocationCity,
  type LocationCountry,
  type LocationDistrict,
  type LocationRegion,
  type PropertyLocationSource,
} from "../../services/locationsApi";
import { propertyTheme } from "./propertyUi";

export type PropertyLocationValue = {
  countryId: number | null;
  provinceId: number | null;
  cityRefId: number | null;
  districtId: number | null;
  latitude: number | null;
  longitude: number | null;
  street: string;
  formattedAddress: string;
  showExactAddress: boolean;
  locationSource: PropertyLocationSource;
  locationConfirmed: boolean;
  city: string;
  suburb: string;
  address: string;
};

type Props = {
  value: PropertyLocationValue;
  onChange: (next: PropertyLocationValue) => void;
};

const DEFAULT_REGION: Region = {
  latitude: -8.838333,
  longitude: 13.234444,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function legacyFromNames(parts: {
  street: string;
  formattedAddress: string;
  cityName: string;
  districtName: string;
}): Pick<PropertyLocationValue, "city" | "suburb" | "address"> {
  const address =
    parts.street ||
    parts.formattedAddress ||
    [parts.districtName, parts.cityName].filter(Boolean).join(", ");
  return {
    city: parts.cityName,
    suburb: parts.districtName,
    address,
  };
}

export default function PropertyLocationPicker({ value, onChange }: Props) {
  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [regions, setRegions] = useState<LocationRegion[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [districts, setDistricts] = useState<LocationDistrict[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<GeocodeResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [pendingFound, setPendingFound] = useState(false);
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(
    value.latitude != null && value.longitude != null
      ? { latitude: value.latitude, longitude: value.longitude }
      : null,
  );

  useEffect(() => {
    void fetchCountries()
      .then(setCountries)
      .catch(() => setError("Could not load countries."));
  }, []);

  useEffect(() => {
    if (!value.countryId) {
      setRegions([]);
      return;
    }
    setLoadingCatalog(true);
    void fetchRegions(value.countryId)
      .then(setRegions)
      .catch(() => setRegions([]))
      .finally(() => setLoadingCatalog(false));
  }, [value.countryId]);

  useEffect(() => {
    if (!value.provinceId) {
      setCities([]);
      return;
    }
    setLoadingCatalog(true);
    void fetchCities(value.provinceId)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoadingCatalog(false));
  }, [value.provinceId]);

  useEffect(() => {
    if (!value.cityRefId) {
      setDistricts([]);
      return;
    }
    void fetchDistricts(value.cityRefId)
      .then(setDistricts)
      .catch(() => setDistricts([]));
  }, [value.cityRefId]);

  const countryName = useMemo(
    () => countries.find((c) => c.id === value.countryId)?.name ?? "",
    [countries, value.countryId],
  );
  const provinceName = useMemo(
    () => regions.find((r) => r.id === value.provinceId)?.name ?? "",
    [regions, value.provinceId],
  );
  const cityName = useMemo(
    () => cities.find((c) => c.id === value.cityRefId)?.name ?? value.city,
    [cities, value.cityRefId, value.city],
  );
  const districtName = useMemo(
    () => districts.find((d) => d.id === value.districtId)?.name ?? value.suburb,
    [districts, value.districtId, value.suburb],
  );

  const applyGeocode = useCallback(
    (result: GeocodeResult, source: PropertyLocationSource, confirmed = false) => {
      const nextCity = result.city.name || cityName;
      const nextDistrict = result.district.name || districtName;
      const legacy = legacyFromNames({
        street: result.street,
        formattedAddress: result.formatted_address,
        cityName: nextCity,
        districtName: nextDistrict,
      });
      setPin({ latitude: result.latitude, longitude: result.longitude });
      setPendingFound(!confirmed);
      onChange({
        ...value,
        countryId: result.country.id ?? value.countryId,
        provinceId: result.region.id ?? value.provinceId,
        cityRefId: result.city.id ?? value.cityRefId,
        districtId: result.district.id ?? value.districtId,
        latitude: result.latitude,
        longitude: result.longitude,
        street: result.street || value.street,
        formattedAddress: result.formatted_address || value.formattedAddress,
        locationSource: source,
        locationConfirmed: confirmed,
        ...legacy,
      });
    },
    [cityName, districtName, onChange, value],
  );

  const reverseAt = useCallback(
    async (latitude: number, longitude: number, source: PropertyLocationSource) => {
      setBusy(true);
      setError(null);
      try {
        const result = await reverseGeocode(latitude, longitude);
        applyGeocode(result, source, false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reverse geocode failed.");
        setPin({ latitude, longitude });
        onChange({
          ...value,
          latitude,
          longitude,
          locationSource: source,
          locationConfirmed: false,
        });
        setPendingFound(true);
      } finally {
        setBusy(false);
      }
    },
    [applyGeocode, onChange, value],
  );

  const requestCurrentLocation = async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError("Location permission is required.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await reverseAt(position.coords.latitude, position.coords.longitude, "gps");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get current location.");
    } finally {
      setBusy(false);
    }
  };

  const searchAddress = async () => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setError("Enter at least 3 characters to search.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const results = await forwardGeocode(query, value.countryId);
      setCandidates(results);
      if (!results.length) setError("No addresses found.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Address search failed.");
    } finally {
      setBusy(false);
    }
  };

  const selectCountry = (countryId: number) => {
    onChange({
      ...value,
      countryId,
      provinceId: null,
      cityRefId: null,
      districtId: null,
      locationConfirmed: false,
      city: "",
      suburb: "",
    });
    setCandidates([]);
    setPendingFound(false);
  };

  const selectProvince = (provinceId: number) => {
    onChange({
      ...value,
      provinceId,
      cityRefId: null,
      districtId: null,
      locationConfirmed: false,
      city: "",
      suburb: "",
    });
    setPendingFound(false);
  };

  const selectCity = (city: LocationCity) => {
    const legacy = legacyFromNames({
      street: value.street,
      formattedAddress: value.formattedAddress,
      cityName: city.name,
      districtName: "",
    });
    const next: PropertyLocationValue = {
      ...value,
      cityRefId: city.id,
      districtId: null,
      locationConfirmed: false,
      ...legacy,
      suburb: "",
    };
    // City centroid is enough to submit for approval; GPS/map can refine later.
    if (city.latitude != null && city.longitude != null) {
      next.latitude = city.latitude;
      next.longitude = city.longitude;
      next.locationSource = value.locationSource || "manual";
      next.locationConfirmed = true;
      next.formattedAddress =
        value.formattedAddress ||
        [city.name, provinceName, countryName].filter(Boolean).join(", ");
      next.address = next.address || next.formattedAddress;
      setPin({ latitude: city.latitude, longitude: city.longitude });
      setPendingFound(false);
    } else {
      setPendingFound(false);
      setError("This city has no map center yet. Use Current Location or Pick on Map.");
    }
    onChange(next);
  };

  const selectDistrict = (district: LocationDistrict) => {
    const legacy = legacyFromNames({
      street: value.street,
      formattedAddress: value.formattedAddress,
      cityName: cityName,
      districtName: district.name,
    });
    onChange({
      ...value,
      districtId: district.id,
      ...legacy,
      locationConfirmed:
        value.latitude != null && value.longitude != null
          ? value.locationConfirmed || true
          : false,
    });
  };

  const confirmLocation = () => {
    if (value.latitude == null || value.longitude == null) return;
    setPendingFound(false);
    onChange({ ...value, locationConfirmed: true });
  };

  const openMap = () => {
    setMapOpen(true);
  };

  const onMapPress = (latitude: number, longitude: number) => {
    void reverseAt(latitude, longitude, "map_pin");
  };

  const mapRegion: Region = pin
    ? {
        latitude: pin.latitude,
        longitude: pin.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Country</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {countries.map((country) => {
          const active = value.countryId === country.id;
          return (
            <Pressable
              key={country.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => selectCountry(country.id)}
            >
              {country.flag_url ? (
                <Image source={{ uri: country.flag_url }} style={styles.flag} />
              ) : country.flag_icon ? (
                <Text style={styles.flagEmoji}>{country.flag_icon}</Text>
              ) : null}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{country.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Province / Region</Text>
      <View style={styles.chipWrap}>
        {regions.map((region) => {
          const active = value.provinceId === region.id;
          return (
            <Pressable
              key={region.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => selectProvince(region.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{region.name}</Text>
            </Pressable>
          );
        })}
        {!regions.length && value.countryId ? (
          <Text style={styles.hint}>{loadingCatalog ? "Loading…" : "No regions found"}</Text>
        ) : null}
      </View>

      <Text style={styles.label}>City</Text>
      <View style={styles.chipWrap}>
        {cities.map((city) => {
          const active = value.cityRefId === city.id;
          return (
            <Pressable
              key={city.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => selectCity(city)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{city.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {districts.length > 0 ? (
        <>
          <Text style={styles.label}>District (optional)</Text>
          <View style={styles.chipWrap}>
            {districts.map((district) => {
              const active = value.districtId === district.id;
              return (
                <Pressable
                  key={district.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => selectDistrict(district)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {district.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Text style={styles.label}>Street address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street / building"
        placeholderTextColor={propertyTheme.textMuted}
        value={value.street}
        onChangeText={(street) => {
          const legacy = legacyFromNames({
            street,
            formattedAddress: value.formattedAddress,
            cityName,
            districtName,
          });
          onChange({ ...value, street, ...legacy, locationConfirmed: false });
        }}
      />

      <Text style={styles.label}>Search address</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Search place or address"
          placeholderTextColor={propertyTheme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => void searchAddress()}
        />
        <Pressable style={styles.iconBtn} onPress={() => void searchAddress()}>
          <Ionicons name="search" size={18} color="#fff" />
        </Pressable>
      </View>
      {candidates.length > 0 ? (
        <View style={styles.candidates}>
          {candidates.map((item, index) => (
            <Pressable
              key={`${item.latitude}-${item.longitude}-${index}`}
              style={styles.candidate}
              onPress={() => {
                applyGeocode(item, "address_search", false);
                setCandidates([]);
                setSearchQuery(item.formatted_address || searchQuery);
              }}
            >
              <Text style={styles.candidateText}>
                {item.formatted_address ||
                  [item.street, item.city.name, item.region.name, item.country.name]
                    .filter(Boolean)
                    .join(", ")}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => void requestCurrentLocation()}>
          <Ionicons name="locate-outline" size={18} color={propertyTheme.primary} />
          <Text style={styles.actionText}>Use Current Location</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={openMap}>
          <Ionicons name="map-outline" size={18} color={propertyTheme.primary} />
          <Text style={styles.actionText}>Pick on Map</Text>
        </Pressable>
      </View>

      {busy ? <ActivityIndicator color={propertyTheme.primary} style={{ marginTop: 8 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {(pendingFound || value.locationConfirmed) && value.latitude != null ? (
        <View style={styles.foundCard}>
          <Text style={styles.foundTitle}>
            {value.locationConfirmed ? "Location confirmed" : "Location Found"}
          </Text>
          <Text style={styles.foundBody}>
            {value.formattedAddress ||
              [value.street, districtName, cityName, provinceName, countryName]
                .filter(Boolean)
                .join(", ")}
          </Text>
          <Text style={styles.coords}>
            {value.latitude.toFixed(5)}, {(value.longitude ?? 0).toFixed(5)}
          </Text>
          {!value.locationConfirmed ? (
            <View style={styles.foundActions}>
              <Pressable style={styles.confirmBtn} onPress={confirmLocation}>
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
              <Pressable
                style={styles.adjustBtn}
                onPress={() => {
                  setPendingFound(false);
                  openMap();
                }}
              >
                <Text style={styles.adjustText}>Adjust</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.adjustBtn}
              onPress={() => {
                onChange({ ...value, locationConfirmed: false });
                openMap();
              }}
            >
              <Text style={styles.adjustText}>Adjust</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Show exact address publicly</Text>
        <Switch
          value={value.showExactAddress}
          onValueChange={(showExactAddress) => onChange({ ...value, showExactAddress })}
          trackColor={{ false: "#cbd5e1", true: propertyTheme.primarySoft }}
          thumbColor={value.showExactAddress ? propertyTheme.primary : "#f8fafc"}
        />
      </View>

      <Modal visible={mapOpen} animationType="slide" onRequestClose={() => setMapOpen(false)}>
        <View style={styles.mapModal}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Pick on Map</Text>
            <Pressable onPress={() => setMapOpen(false)}>
              <Ionicons name="close" size={24} color={propertyTheme.text} />
            </Pressable>
          </View>
          {Platform.OS === "web" ? (
            <View style={styles.webMapFallback}>
              <Text style={styles.hint}>
                Tap below to set the pin from your current GPS position, then Confirm.
              </Text>
              <Text style={styles.coords}>
                {pin
                  ? `${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}`
                  : "No pin yet"}
              </Text>
              <Pressable
                style={styles.confirmBtn}
                onPress={() => {
                  void requestCurrentLocation().then(() => setMapOpen(false));
                }}
              >
                <Text style={styles.confirmText}>Use Current Location</Text>
              </Pressable>
            </View>
          ) : (
            <MapView
              style={styles.map}
              region={mapRegion}
              onPress={(event) => {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                onMapPress(latitude, longitude);
              }}
            >
              {pin ? (
                <Marker
                  coordinate={pin}
                  draggable
                  onDragEnd={(event) => {
                    const { latitude, longitude } = event.nativeEvent.coordinate;
                    onMapPress(latitude, longitude);
                  }}
                />
              ) : null}
            </MapView>
          )}
          <View style={styles.mapFooter}>
            <Pressable
              style={[styles.confirmBtn, !pin && styles.disabled]}
              disabled={!pin}
              onPress={() => {
                setMapOpen(false);
                setPendingFound(true);
              }}
            >
              <Text style={styles.confirmText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: propertyTheme.textMuted,
    textTransform: "uppercase",
  },
  chipRow: { maxHeight: 48 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: propertyTheme.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: propertyTheme.primary, borderColor: propertyTheme.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: propertyTheme.textSecondary },
  chipTextActive: { color: "#fff" },
  flag: { width: 18, height: 12, borderRadius: 2 },
  flagEmoji: { fontSize: 14 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: propertyTheme.text,
  },
  searchRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  searchInput: { flex: 1 },
  iconBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 12,
    padding: 12,
  },
  candidates: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    overflow: "hidden",
  },
  candidate: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: propertyTheme.border,
  },
  candidateText: { color: propertyTheme.textSecondary, fontSize: 13 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: propertyTheme.primary,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: { color: propertyTheme.primary, fontWeight: "700", fontSize: 13 },
  foundCard: {
    marginTop: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#99f6e4",
    padding: 14,
    gap: 6,
  },
  foundTitle: { fontWeight: "800", color: propertyTheme.primary },
  foundBody: { color: propertyTheme.textSecondary, lineHeight: 20 },
  coords: { fontSize: 12, color: propertyTheme.textMuted },
  foundActions: { flexDirection: "row", gap: 8, marginTop: 6 },
  confirmBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  confirmText: { color: "#fff", fontWeight: "800" },
  adjustBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: propertyTheme.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  adjustText: { color: propertyTheme.primary, fontWeight: "800" },
  toggleRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleLabel: { color: propertyTheme.textSecondary, fontWeight: "600", flex: 1, paddingRight: 12 },
  error: { color: propertyTheme.danger, fontSize: 13 },
  hint: { color: propertyTheme.textMuted, fontSize: 12 },
  mapModal: { flex: 1, backgroundColor: "#fff" },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  mapTitle: { fontSize: 18, fontWeight: "800", color: propertyTheme.text },
  map: { flex: 1 },
  mapFooter: { padding: 16 },
  webMapFallback: { flex: 1, padding: 16, gap: 12, justifyContent: "center" },
  disabled: { opacity: 0.5 },
});
