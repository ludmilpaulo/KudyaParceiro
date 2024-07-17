import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import * as ImagePicker from 'expo-image-picker';
import { selectUser } from '../../redux/slices/authSlice';
import { fetchCategorias, fetchProducts, addProduct, updateProduct, deleteProduct } from '../../services/apiService';
import { Product, Categoria, ImageType } from '../../services/types';
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

  const handleAddProduct = async (data: Product) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('short_description', data.short_description);
    if (data.image && data.image[0]) {
      formData.append('image', {
        uri: data.image[0].uri,
        name: 'product_image.jpg',
        type: 'image/jpeg',
      } as any);
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
    if (data.image && data.image[0]) {
      formData.append('image', {
        uri: data.image[0].uri,
        name: 'product_image.jpg',
        type: 'image/jpeg',
      } as any);
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

      <AddProductModal
        categorias={categorias}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        onSubmit={handleAddProduct}
        errors={{}}
      />

      <EditProductModal
        categorias={categorias}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editingProduct={editingProduct}
        onSubmit={handleUpdateProduct}
        errors={{}}
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
});

export default Products;
