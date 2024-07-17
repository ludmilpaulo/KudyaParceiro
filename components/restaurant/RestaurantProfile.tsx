import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, Alert } from 'react-native';
import { RestaurantType } from "../../services/types";
import { updateRestaurant } from "../../services/apiService";
import tailwind from 'twrnc';
import * as ImagePicker from 'expo-image-picker';

type RestaurantProfileProps = {
  restaurant: RestaurantType;
  setRestaurant: (restaurant: RestaurantType) => void;
};

const RestaurantProfile: React.FC<RestaurantProfileProps> = ({ restaurant, setRestaurant }) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: restaurant.name,
    phone: restaurant.phone,
    address: restaurant.address,
    logo: null as string | null,
    restaurant_license: null as string | null,
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = async (name: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({
        ...formData,
        [name]: result.assets[0].uri,
      });
    }
  };

  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleSave = async () => {
    const updatedData = new FormData();
    updatedData.append("name", formData.name);
    updatedData.append("phone", formData.phone);
    updatedData.append("address", formData.address);
    if (formData.logo) {
      const logoBlob = await uriToBlob(formData.logo);
      updatedData.append("logo", logoBlob, 'logo.jpg');
    }
    if (formData.restaurant_license) {
      const licenseBlob = await uriToBlob(formData.restaurant_license);
      updatedData.append("restaurant_license", licenseBlob, 'license.jpg');
    }

    try {
      const updatedRestaurant = await updateRestaurant(restaurant.id, updatedData);
      setRestaurant(updatedRestaurant);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating restaurant data", error);
      Alert.alert("Error", "There was an error updating the restaurant data.");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: restaurant.name,
      phone: restaurant.phone,
      address: restaurant.address,
      logo: null,
      restaurant_license: null,
    });
  };

  return (
    <View style={tailwind`p-4 bg-white rounded-lg`}>
      <View style={tailwind`flex-row justify-between items-center mb-4`}>
        <Text style={tailwind`text-2xl font-bold`}>Perfil do Restaurante</Text>
        {editMode ? (
          <View style={tailwind`flex-row`}>
            <View style={tailwind`mr-2`}>
              <Button onPress={handleSave} title="Save" color="green" />
            </View>
            <Button onPress={handleCancel} title="Cancel" color="red" />
          </View>
        ) : (
          <Button onPress={() => setEditMode(true)} title="Edit" color="blue" />
        )}
      </View>
      <View>
        <View style={tailwind`mb-4`}>
          <Text style={tailwind`text-sm font-medium`}>Nome do Restaurante</Text>
          <TextInput
            style={tailwind`mt-1 w-full p-2 border rounded-md`}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            editable={editMode}
          />
        </View>
        <View style={tailwind`mb-4`}>
          <Text style={tailwind`text-sm font-medium`}>Telefone do Restaurante</Text>
          <TextInput
            style={tailwind`mt-1 w-full p-2 border rounded-md`}
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            editable={editMode}
          />
        </View>
        <View style={tailwind`mb-4`}>
          <Text style={tailwind`text-sm font-medium`}>Endereço do Restaurante</Text>
          <TextInput
            style={tailwind`mt-1 w-full p-2 border rounded-md`}
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            editable={editMode}
          />
        </View>
        <View style={tailwind`mb-4`}>
          <Text style={tailwind`text-sm font-medium`}>Logotipo do Restaurante</Text>
          {formData.logo && (
            <Image source={{ uri: formData.logo }} style={tailwind`w-32 h-32 mt-2`} />
          )}
          <Button
            onPress={() => handleFileChange('logo')}
            title="Select Logo"
            color="blue"
            disabled={!editMode}
          />
        </View>
        <View style={tailwind`mb-4`}>
          <Text style={tailwind`text-sm font-medium`}>Licença do Restaurante</Text>
          {formData.restaurant_license && (
            <Image source={{ uri: formData.restaurant_license }} style={tailwind`w-32 h-32 mt-2`} />
          )}
          <Button
            onPress={() => handleFileChange('restaurant_license')}
            title="Select License"
            color="blue"
            disabled={!editMode}
          />
        </View>
      </View>
    </View>
  );
};

export default RestaurantProfile;
