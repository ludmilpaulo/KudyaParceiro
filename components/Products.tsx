import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import { selectUser } from '../redux/slices/authSlice';
import { fetchCategorias, fetchProducts, addProduct, updateProduct, deleteProduct } from '../services/apiService';
import { Product, Categoria } from '../services/types';
import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';

const Products: React.FC = () => {
  const user = useSelector(selectUser);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Product>();

  useEffect(() => {
    const loadCategorias = async () => {
      setLoading(true);
      try {
        const data = await fetchCategorias();
        setCategorias(data);
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
      const data = await fetchProducts(user.user_id);
      setProducts(data);
    } catch (error) {
      console.error('Falha ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onSubmit = async (data: Product) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('short_description', data.short_description);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }
    formData.append('price', String(data.price));
    formData.append('category', selectedCategory);
    formData.append('user_id', String(user.user_id));
    formData.append('access_token', user.token);

    setLoading(true);
    try {
      await addProduct(formData);
      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      setIsAddModalOpen(false);
      reset();
      loadProducts();
    } catch (error) {
      console.error('Falha ao adicionar produto:', error);
      Alert.alert('Erro', 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: Product) => {
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('short_description', data.short_description);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }
    formData.append('price', String(data.price));
    formData.append('category', selectedCategory);
    formData.append('user_id', String(user.user_id));
    formData.append('access_token', user.token);

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

  const handleDelete = async (productId: number) => {
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
    setEditingProduct(product);
    setSelectedCategory(product.category.toString());
    setIsEditModalOpen(true);
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
        <ScrollView horizontal>
          <View style={tailwind`min-w-full bg-white border`}>
            <View style={tailwind`flex flex-row bg-gray-200`}>
              <Text style={tailwind`px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider`}>
                Nome
              </Text>
              <Text style={tailwind`px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider`}>
                Descrição
              </Text>
              <Text style={tailwind`px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider`}>
                Preço
              </Text>
              <Text style={tailwind`px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider`}>
                Imagem
              </Text>
              <Text style={tailwind`px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider`}>
                Ações
              </Text>
            </View>
            {products?.map((product, index) => (
              <View key={index} style={tailwind`flex flex-row hover:bg-gray-100`}>
                <Text style={tailwind`px-6 py-4 border-b border-gray-300`}>{product.name}</Text>
                <Text style={tailwind`px-6 py-4 border-b border-gray-300`}>{product.short_description}</Text>
                <Text style={tailwind`px-6 py-4 border-b border-gray-300`}>{product.price} Kz</Text>
                <View style={tailwind`px-6 py-4 border-b border-gray-300`}>
                  <Image
                    source={{ uri: product.image || 'https://www.kudya.shop/media/logo/azul.png' }}
                    style={tailwind`w-16 h-16 rounded`}
                  />
                </View>
                <View style={tailwind`px-6 py-4 border-b border-gray-300 flex flex-row`}>
                  <TouchableOpacity
                    onPress={() => openEditModal(product)}
                    style={tailwind`text-blue-600 hover:text-blue-800 focus:outline-none`}
                  >
                    <Icon name="edit" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(product.id!)}
                    style={tailwind`ml-4 text-red-600 hover:text-red-800 focus:outline-none`}
                  >
                    <Icon name="trash" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <AddProductModal
        categorias={categorias}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        onSubmit={onSubmit}
        errors={errors}
      />

      <EditProductModal
        categorias={categorias}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editingProduct={editingProduct}
        handleUpdate={handleUpdate}
        errors={errors}
      />
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
});

export default Products;
