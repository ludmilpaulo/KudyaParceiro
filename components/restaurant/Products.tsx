import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StyleSheet, Button, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import tailwind from 'twrnc';
import { useForm, Controller } from 'react-hook-form';
import { selectUser } from '../../redux/slices/authSlice';
import { fetchCategorias, fetchProducts, addProduct, updateProduct, deleteProduct } from '../../services/apiService';
import { Product, Categoria } from '../../services/types';
import * as ImagePicker from 'expo-image-picker';

const Products: React.FC = () => {
  const user = useSelector(selectUser);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Product>();
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const loadCategorias = async () => {
      setLoading(true);
      try {
        console.log('Fetching categories...');
        const data = await fetchCategorias();
        setCategorias(data);
        console.log('Categories fetched:', data);
      } catch (error) {
        console.error('Falha ao buscar categorias:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategorias();
  }, []);

  const loadProducts = useCallback(async () => {
    if (!user?.user_id) return;
    setLoading(true);
    try {
      console.log('Fetching products for user:', user.user_id);
      const data = await fetchProducts(user.user_id);
      console.log('Products fetched:', data);
      if (selectedCategory) {
        const filteredProducts = data.filter(product => product.category.toString() === selectedCategory);
        setProducts(filteredProducts);
        console.log('Filtered products:', filteredProducts);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error('Falha ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddProduct = async (data: Product) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('short_description', data.short_description);
    if (image) {
      formData.append('image', {
        uri: image,
        name: 'product_image.jpg',
        type: 'image/jpeg',
      } as any);
    }
    formData.append('price', String(data.price));
    formData.append('category', selectedCategory);
    formData.append('user_id', String(user.user_id));
    formData.append('access_token', user.token);

    console.log('Adding product with data:', formData);

    setLoading(true);
    try {
      await addProduct(formData);
      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      setIsAddModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Falha ao adicionar produto:', error);
      Alert.alert('Erro', 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (data: Product) => {
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('short_description', data.short_description);
    if (image) {
      formData.append('image', {
        uri: image,
        name: 'product_image.jpg',
        type: 'image/jpeg',
      } as any);
    }
    formData.append('price', String(data.price));
    formData.append('category', selectedCategory);
    formData.append('user_id', String(user.user_id));
    formData.append('access_token', user.token);

    console.log('Updating product with data:', formData);

    setLoading(true);
    try {
      await updateProduct(editingProduct.id!, formData);
      Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      setIsEditModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Falha ao atualizar produto:', error);
      Alert.alert('Erro', 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!user?.user_id) return;
    Alert.alert(
      'Confirmar',
      'Tem certeza de que deseja excluir este produto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('Deleting product with ID:', productId);
              await deleteProduct(productId, user.user_id);
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
              loadProducts();
            } catch (error) {
              console.error('Falha ao excluir produto:', error);
              Alert.alert('Erro', 'Erro desconhecido');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const openEditModal = (product: Product) => {
    console.log('Opening edit modal for product:', product);
    setEditingProduct(product);
    setSelectedCategory(product.category.toString());
    setIsEditModalOpen(true);
  };

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

  return (
    <View style={tailwind`flex-1 px-4`}>
      <View style={tailwind`flex justify-end py-4`}>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          style={tailwind`px-4 py-2 bg-blue-500 rounded`}
        >
          <Text style={tailwind`text-white`}>Adicionar Produto</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {!loading && (
        <ScrollView>
          {products?.map((product, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardContent}>
                <Image
                  source={{ uri: product.image ? product.image : 'https://www.kudya.shop/media/logo/azul.png' }}
                  style={styles.cardImage}
                />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardTitle}>{product.name}</Text>
                  <Text style={styles.cardDescription}>{product.short_description}</Text>
                  <Text style={styles.cardPrice}>{product.price} Kz</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => openEditModal(product)}
                    style={tailwind`text-green-600 hover:text-green-800 focus:outline-none`}
                  >
                    <Icon name="edit" size={20} color="green" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteProduct(product.id!)}
                    style={tailwind`ml-4 text-red-600 hover:text-red-800 focus:outline-none`}
                  >
                    <Icon name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

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
                  items={categorias.map(cat => ({ label: cat.name, value: cat.id.toString() }))}
                  setOpen={setOpen}
                  setValue={setSelectedCategory}
                  setItems={setCategorias}
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
                <TouchableOpacity onPress={handleSubmit(handleAddProduct)} style={tailwind`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600`}>
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

      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={tailwind`text-2xl font-bold mb-4`}>Editar Produto</Text>
            <ScrollView>
              <View style={tailwind`mb-4 z-10`}>
                <Text style={tailwind`mb-2`}>Categoria</Text>
                <DropDownPicker
                  open={open}
                  value={selectedCategory}
                  items={categorias.map(cat => ({ label: cat.name, value: cat.id.toString() }))}
                  setOpen={setOpen}
                  setValue={setSelectedCategory}
                  setItems={setCategorias}
                  placeholder="Selecione ou digite uma categoria"
                  searchable={true}
                  searchPlaceholder="Digite para pesquisar..."
                  style={tailwind`w-full p-2 border rounded`}
                />
                {errors.category && <Text style={tailwind`text-red-500`}>Categoria é obrigatória</Text>}
              </View>
              <View style={tailwind`mb-4`}>
                <Text style={tailwind`mb-2`}>Nome</Text>
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
                  defaultValue={editingProduct?.name}
                  rules={{ required: true }}
                />
                {errors.name && <Text style={tailwind`text-red-500`}>Nome é obrigatório</Text>}
              </View>
              <View style={tailwind`mb-4`}>
                <Text style={tailwind`mb-2`}>Pequena Descrição</Text>
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
                  defaultValue={editingProduct?.short_description}
                  rules={{ required: true }}
                />
                {errors.short_description && <Text style={tailwind`text-red-500`}>Descrição curta é obrigatória</Text>}
              </View>
              <View style={tailwind`mb-4`}>
                <Text style={tailwind`mb-2`}>Imagem</Text>
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
                <Text style={tailwind`mb-2`}>Preço</Text>
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
                  defaultValue={editingProduct?.price.toString()}
                  rules={{ required: true }}
                />
                {errors.price && <Text style={tailwind`text-red-500`}>Preço é obrigatório</Text>}
              </View>
              <View style={tailwind`flex flex-row justify-between mt-4`}>
                <TouchableOpacity onPress={handleSubmit(handleUpdateProduct)} style={tailwind`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600`}>
                  <Text style={tailwind`text-white`}>Atualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditModalOpen(false)} style={tailwind`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600`}>
                  <Text style={tailwind`text-white`}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  cardActions: {
    flexDirection: 'row',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
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
});

export default Products;
