import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, Button, KeyboardAvoidingView, Platform, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import tailwind from 'twrnc';
import { Categoria, Product } from '../../services/types';
import * as ImagePicker from 'expo-image-picker';

interface AddProductModalProps {
  categorias: Categoria[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (value: boolean) => void;
  onSubmit: (data: Product) => void;
  errors: any;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  categorias,
  selectedCategory,
  setSelectedCategory,
  isAddModalOpen,
  setIsAddModalOpen,
  onSubmit,
  errors,
}) => {
  const { control, handleSubmit, setValue } = useForm<Product>();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(categorias.map(cat => ({ label: cat.name, value: cat.id.toString() })));
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initial categories:', categorias);
    console.log('Initial selected category:', selectedCategory);
  }, [categorias, selectedCategory]);

  useEffect(() => {
    console.log('Selected category:', selectedCategory);
  }, [selectedCategory]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedImage = result.assets[0];
      setImage(pickedImage.uri);
      setValue('image', pickedImage.uri);
      console.log('Picked image:', pickedImage.uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const takenPhoto = result.assets[0];
      setImage(takenPhoto.uri);
      setValue('image', takenPhoto.uri);
      console.log('Taken photo:', takenPhoto.uri);
    }
  };

  if (!isAddModalOpen) return null;

  return (
    <Modal
      visible={isAddModalOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsAddModalOpen(false)}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={tailwind`text-2xl font-bold mb-4`}>Adicionar Produto</Text>
          <ScrollView>
            <View style={tailwind`mb-4 z-10`}>
              <Text style={tailwind`block mb-2`}>Categoria</Text>
              <DropDownPicker
                open={open}
                value={selectedCategory}
                items={items}
                setOpen={setOpen}
                setValue={setSelectedCategory}
                setItems={setItems}
                placeholder="Selecione ou digite uma categoria"
                searchable={true}
                searchPlaceholder="Digite para pesquisar..."
                style={tailwind`w-full p-2 border rounded`}
              />
              {errors.category && <Text style={tailwind`text-red-500`}>Categoria é obrigatória</Text>}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Nome</Text>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={tailwind`w-full p-2 border rounded`}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="name"
                rules={{ required: true }}
              />
              {errors.name && <Text style={tailwind`text-red-500`}>Nome é obrigatório</Text>}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Pequena Descrição</Text>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={tailwind`w-full p-2 border rounded`}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="short_description"
                rules={{ required: true }}
              />
              {errors.short_description && <Text style={tailwind`text-red-500`}>Descrição curta é obrigatória</Text>}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Imagem</Text>
              <View style={tailwind`flex-row justify-between`}>
                <Button title="Escolher da Galeria" onPress={pickImage} />
                <Button title="Tirar Foto" onPress={takePhoto} />
              </View>
              {image && (
                <View style={tailwind`mt-4`}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                </View>
              )}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Preço</Text>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    keyboardType="numeric"
                    style={tailwind`w-full p-2 border rounded`}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="price"
                rules={{ required: true }}
              />
              {errors.price && <Text style={tailwind`text-red-500`}>Preço é obrigatório</Text>}
            </View>
            <View style={tailwind`flex flex-row justify-between mt-4`}>
              <TouchableOpacity onPress={handleSubmit(onSubmit)} style={tailwind`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600`}>
                <Text style={tailwind`text-white`}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} style={tailwind`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600`}>
                <Text style={tailwind`text-white`}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
});

export default AddProductModal;
