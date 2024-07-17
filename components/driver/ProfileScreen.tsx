import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Image } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';

import * as ImagePicker from 'expo-image-picker';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI } from '../../services/types';


const ProfileScreen = () => {
  const user = useSelector(selectUser);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    avatar: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.post(`${baseAPI}/driver/profile/`, { user_id: user.user_id });
        setProfileData(response.data.customer_detais);
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };

    fetchProfileData();
  }, [user?.token]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      setProfileData({ ...profileData, avatar: result.assets[0].uri });
    }
  };
  

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('access_token', user.token);
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      if (profileData.avatar) {
        formData.append('avatar', {
          uri: profileData.avatar,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
      }
      await axios.post(`${baseAPI}/driver/profile/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Primeiro Nome</Text>
      <TextInput
        style={styles.input}
        value={profileData.first_name}
        onChangeText={(text) => setProfileData({ ...profileData, first_name: text })}
      />
      <Text style={styles.label}>Último Nome</Text>
      <TextInput
        style={styles.input}
        value={profileData.last_name}
        onChangeText={(text) => setProfileData({ ...profileData, last_name: text })}
      />
      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={profileData.phone}
        onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
      />
      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        value={profileData.address}
        onChangeText={(text) => setProfileData({ ...profileData, address: text })}
      />
      <Button title="Escolher Avatar" onPress={pickImage} />
      {profileData.avatar && (
        <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
      )}
      <Button title="Salvar" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginVertical: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default ProfileScreen;
