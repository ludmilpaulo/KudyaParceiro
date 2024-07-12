import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { selectUser } from "../redux/slices/authSlice";
import { updateDriverProfile } from "../services/driverService";
import { baseAPI } from "../services/types";

const UserProfile: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [firstName, setFirstName] = useState<string>(user?.first_name || "");
  const [lastName, setLastName] = useState<string>(user?.last_name || "");
  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [address, setAddress] = useState<string>(user?.address || "");
  const [avatar, setAvatar] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImagePicker = async (source: 'camera' | 'library') => {
    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("access_token", user?.access_token);

      if (avatar) {
        const localUri = avatar.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("avatar", {
          uri: localUri,
          name: filename,
          type
        } as any);
      }

      const response = await updateDriverProfile(formData);
      if (response.status === "Os Seus Dados enviados com sucesso") {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso.");
        navigation.navigate("EntregadorDashboard");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o perfil. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Atualizar Perfil</Text>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar.uri }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarPlaceholder}>Selecionar Avatar</Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => handleImagePicker('camera')} style={styles.iconButton}>
              <MaterialCommunityIcons name="camera" size={24} color="#0077cc" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImagePicker('library')} style={styles.iconButton}>
              <MaterialCommunityIcons name="image" size={24} color="#0077cc" />
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          placeholder="Primeiro Nome"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <TextInput
          placeholder="Último Nome"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <TextInput
          placeholder="Telefone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
        <TextInput
          placeholder="Endereço"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
          <Text style={styles.submitButtonText}>Atualizar Perfil</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowColor: '#000',
    shadowOffset: { height: 0, width: 0 }
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    fontSize: 16,
    color: '#0077cc',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  iconButton: {
    marginHorizontal: 10,
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#0077cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
});

export default UserProfile;
