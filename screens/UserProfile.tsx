import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../navigation/hooks";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { selectUser } from "../redux/slices/authSlice";
import { updateDriverProfile } from "../services/driverService";
import { baseAPI } from "../services/types";
import { useDriverTranslation } from "../hooks/useDriverTranslation";
import { useGetDriverVerificationStatusQuery } from "../redux/slices/driverApi";

const UserProfile: React.FC = () => {
  const navigation = useAppNavigation();
  const { dt } = useDriverTranslation();
  const user = useSelector(selectUser);
  const { data: verification, refetch: refetchVerification } = useGetDriverVerificationStatusQuery();
  const profileUser = user?.user as {
    first_name?: string;
    last_name?: string;
    phone?: string;
  } | undefined;

  const [firstName, setFirstName] = useState(
    String(user?.first_name || profileUser?.first_name || ""),
  );
  const [lastName, setLastName] = useState(
    String(user?.last_name || profileUser?.last_name || ""),
  );
  const [phone, setPhone] = useState(String(user?.phone || profileUser?.phone || ""));
  const [address, setAddress] = useState(String(user?.address || ""));
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [avatar, setAvatar] = useState<{ uri: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.user_id) return;
      try {
        const response = await fetch(`${baseAPI}/driver/profile/`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.user_id }),
        });
        if (!response.ok) return;
        const data = await response.json();
        const details = data?.customer_detais ?? data?.customer_details;
        if (!details || typeof details !== "object") return;
        if (details.first_name) setFirstName(String(details.first_name));
        if (details.last_name) setLastName(String(details.last_name));
        if (details.phone) setPhone(String(details.phone));
        if (details.address) setAddress(String(details.address));
        if (details.bank) setBank(String(details.bank));
        if (details.account_number) setAccountNumber(String(details.account_number));
        if (details.avatar && typeof details.avatar === "string") {
          setAvatar({ uri: details.avatar.startsWith("http") ? details.avatar : `${baseAPI}${details.avatar}` });
        }
      } catch {
        // ignore — form still editable with auth user defaults
      }
    };
    loadProfile();
  }, [user?.user_id]);

  const handleImagePicker = async (source: "camera" | "library") => {
    let result;
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(dt("error"), dt("cameraPermissionRequired"));
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(dt("error"), dt("galleryPermissionRequired"));
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !bank.trim() || !accountNumber.trim()) {
      Alert.alert(dt("error"), dt("fillRequiredFields"));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("phone", phone.trim());
      formData.append("address", address.trim());
      formData.append("bank", bank.trim());
      formData.append("account_number", accountNumber.trim());
      formData.append(
        "access_token",
        String(user?.access_token || user?.token || user?.access || ""),
      );

      if (avatar?.uri && !avatar.uri.startsWith("http")) {
        const localUri = avatar.uri;
        const filename = localUri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("avatar", { uri: localUri, name: filename, type } as unknown as Blob);
      }

      const response = await updateDriverProfile(formData);
      if (response.status === "Os Seus Dados enviados com sucesso") {
        await refetchVerification();
        Alert.alert(dt("success"), dt("saveProfile"), [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(dt("error"), dt("error"));
      }
    } catch {
      Alert.alert(dt("error"), dt("error"));
    } finally {
      setLoading(false);
    }
  };

  const completion = verification?.profileCompletionPercentage ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{dt("completeProfile")}</Text>

          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              {dt("profileProgress")}: {completion}%
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(completion, 100)}%` }]} />
            </View>
          </View>

          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar.uri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={40} color="#94a3b8" />
              </View>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => handleImagePicker("camera")} style={styles.iconButton}>
                <MaterialCommunityIcons name="camera" size={24} color="#0171CE" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImagePicker("library")} style={styles.iconButton}>
                <MaterialCommunityIcons name="image" size={24} color="#0171CE" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.fieldLabel}>{dt("firstName")} *</Text>
          <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} />

          <Text style={styles.fieldLabel}>{dt("lastName")} *</Text>
          <TextInput value={lastName} onChangeText={setLastName} style={styles.input} />

          <Text style={styles.fieldLabel}>{dt("phone")} *</Text>
          <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />

          <Text style={styles.fieldLabel}>{dt("address")}</Text>
          <TextInput value={address} onChangeText={setAddress} style={styles.input} />

          <Text style={styles.fieldLabel}>{dt("bankName")} *</Text>
          <TextInput value={bank} onChangeText={setBank} style={styles.input} />

          <Text style={styles.fieldLabel}>{dt("accountNumber")} *</Text>
          <TextInput value={accountNumber} onChangeText={setAccountNumber} style={styles.input} keyboardType="number-pad" />

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{dt("saveProfile")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formContainer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16, color: "#0f172a" },
  progressWrap: { marginBottom: 20 },
  progressLabel: { fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: "600" },
  progressTrack: { height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#0171CE", borderRadius: 4 },
  avatarContainer: { justifyContent: "center", alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 10, gap: 16 },
  iconButton: { padding: 8 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 4, marginTop: 4 },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#0171CE",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 16,
  },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
});

export default UserProfile;
