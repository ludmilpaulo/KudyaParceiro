import React, { ChangeEvent, useState } from "react";
import { View, Text, TextInput, Button } from 'react-native';
import { RestaurantType } from "../services/types";
import { updateRestaurant } from "../services/apiService";
import tailwind from 'twrnc';

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
    logo: null as File | null,
    restaurant_license: null as File | null,
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData({
      ...formData,
      [name]: file,
    });
  };

  const handleSave = async () => {
    const updatedData = new FormData();
    updatedData.append("name", formData.name);
    updatedData.append("phone", formData.phone);
    updatedData.append("address", formData.address);
    if (formData.logo) {
      updatedData.append("logo", formData.logo);
    }
    if (formData.restaurant_license) {
      updatedData.append("restaurant_license", formData.restaurant_license);
    }

    try {
      const updatedRestaurant = await updateRestaurant(restaurant.id, updatedData);
      setRestaurant(updatedRestaurant);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating restaurant data", error);
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
          <View style={tailwind`flex-row space-x-2`}>
            <Button onPress={handleSave} title="Save" color="green" />
            <Button onPress={handleCancel} title="Cancel" color="red" />
          </View>
        ) : (
          <Button onPress={() => setEditMode(true)} title="Edit" color="blue" />
        )}
      </View>
      <View style={tailwind`space-y-4`}>
        <View>
          <Text style={tailwind`block text-sm font-medium`}>Nome do Restaurante</Text>
          <TextInput
            style={tailwind`mt-1 block w-full p-2 border rounded-md`}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            editable={editMode}
          />
        </View>
        <View>
          <Text style={tailwind`block text-sm font-medium`}>Telefone do Restaurante</Text>
          <TextInput
            style={tailwind`mt-1 block w-full p-2 border rounded-md`}
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            editable={editMode}
          />
        </View>
        <View>
          <Text style={tailwind`block text-sm font-medium`}>Endereço do Restaurante</Text>
          <TextInput
            style={tailwind`mt-1 block w-full p-2 border rounded-md`}
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            editable={editMode}
          />
        </View>
        <View>
          <Text style={tailwind`block text-sm font-medium`}>Logotipo do Restaurante</Text>
          <Button
            onPress={() => handleFileChange('logo', null)} // Update with actual file picker logic
            title="Select Logo"
            color="blue"
            disabled={!editMode}
          />
        </View>
        <View>
          <Text style={tailwind`block text-sm font-medium`}>Licença do Restaurante</Text>
          <Button
            onPress={() => handleFileChange('restaurant_license', null)} // Update with actual file picker logic
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
