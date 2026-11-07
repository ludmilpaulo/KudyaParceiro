import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StyleSheet, Button, Modal, TextInput, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import tailwind from 'twrnc';
import { useForm, Controller } from 'react-hook-form';
import { fetchCategorias, fetchProducts, addProduct, updateProduct, deleteProduct } from '../../services/apiService';
import { Product, Categoria } from '../../services/types';
import * as ImagePicker from 'expo-image-picker';
import { appendFormDataFile } from '../../utils/formDataFile';

type ProductFormValues = {
  name: string;
  short_description: string;
  price: string;
  stock: string;
  is_active: boolean;
};

const EMPTY_FORM: ProductFormValues = {
  name: '',
  short_description: '',
  price: '',
  stock: '0',
  is_active: true,
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const firstImage = (product: Product): string | null => {
  const source = product.images?.length ? product.images : product.image;
  if (Array.isArray(source)) return source.find((uri) => typeof uri === 'string' && uri) ?? null;
  return typeof source === 'string' && source ? source : null;
};

const plainText = (value?: string | null) =>
  (value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const stockCount = (product: Product) => {
  const value = Number(product.stock);
  return Number.isFinite(value) ? value : 0;
};

const productCategoryId = (product: Product, categorias: Categoria[]): string => {
  if (product.category_id != null) return String(product.category_id);
  const match = categorias.find((cat) => cat.name === product.category || String(cat.id) === String(product.category));
  return match ? String(match.id) : '';
};

const confirmAction = (title: string, message: string, onConfirm: () => void) => {
  // Alert.alert is a no-op on react-native-web.
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'OK', onPress: onConfirm },
  ]);
};

const notify = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message);
    return;
  }
  Alert.alert(title, message);
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    defaultValues: EMPTY_FORM,
  });
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await fetchCategorias();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (error) {
        setLoadError(errorMessage(error, 'Falha ao buscar categorias.'));
      }
    };
    loadCategorias();
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchProducts(0);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(errorMessage(error, 'Falha ao buscar produtos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const visibleProducts = useMemo(
    () => (filterCategory
      ? products.filter((product) => productCategoryId(product, categorias) === filterCategory)
      : products),
    [products, filterCategory, categorias],
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormCategory('');
    setImage(null);
    setFormError(null);
    reset(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormCategory(productCategoryId(product, categorias));
    setImage(null);
    setFormError(null);
    reset({
      name: product.name ?? '',
      short_description: plainText(product.description ?? product.short_description),
      price: String(product.base_price ?? product.price ?? ''),
      stock: String(stockCount(product)),
      is_active: product.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImage(null);
    setOpen(false);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setFormError(null);
    if (!formCategory) {
      setFormError('Categoria é obrigatória.');
      return;
    }
    const price = Number(String(data.price).replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Preço inválido.');
      return;
    }
    const stock = Number(data.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      setFormError('Stock deve ser um número inteiro igual ou superior a 0.');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name.trim());
    formData.append('short_description', data.short_description.trim());
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    formData.append('is_active', data.is_active ? 'true' : 'false');
    formData.append('category_id', formCategory);
    if (image) {
      await appendFormDataFile(formData, 'image', {
        uri: image,
        name: 'product_image.jpg',
        type: 'image/jpeg',
      });
    }

    setSaving(true);
    try {
      if (editingProduct?.id != null) {
        await updateProduct(editingProduct.id, formData);
        notify('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        await addProduct(formData);
        notify('Sucesso', 'Produto adicionado com sucesso!');
      }
      closeModal();
      reset(EMPTY_FORM);
      loadProducts();
    } catch (error) {
      setFormError(errorMessage(error, 'Não foi possível guardar o produto.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    confirmAction('Confirmar', 'Tem certeza de que deseja excluir este produto?', async () => {
      setLoading(true);
      try {
        await deleteProduct(productId, 0);
        loadProducts();
      } catch (error) {
        setLoading(false);
        notify('Erro', errorMessage(error, 'Não foi possível excluir o produto.'));
      }
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const previewImage = image ?? (editingProduct ? firstImage(editingProduct) : null);

  return (
    <View style={tailwind`flex-1 px-4`}>
      <View style={tailwind`flex justify-end py-4`}>
        <TouchableOpacity onPress={openAddModal} style={tailwind`px-4 py-2 bg-blue-500 rounded`}>
          <Text style={tailwind`text-white`}>Adicionar Produto</Text>
        </TouchableOpacity>
      </View>

      {categorias.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
        >
          {[{ id: '', name: 'Todas' }, ...categorias.map((cat) => ({ id: String(cat.id), name: cat.name }))].map((cat) => (
            <TouchableOpacity
              key={cat.id || 'all'}
              onPress={() => setFilterCategory(cat.id)}
              style={tailwind`mr-2 px-3 py-1 rounded-full ${filterCategory === cat.id ? 'bg-blue-500' : 'bg-gray-200'}`}
            >
              <Text style={tailwind`${filterCategory === cat.id ? 'text-white' : 'text-gray-700'}`}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {!loading && loadError ? (
        <View style={tailwind`items-center py-6`}>
          <Text style={tailwind`text-red-600 mb-2`}>{loadError}</Text>
          <TouchableOpacity onPress={loadProducts} style={tailwind`px-4 py-2 bg-blue-500 rounded`}>
            <Text style={tailwind`text-white`}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loading && !loadError && visibleProducts.length === 0 ? (
        <Text style={tailwind`text-center text-gray-500 py-6`}>
          {filterCategory ? 'Nenhum produto nesta categoria.' : 'Ainda não tem produtos.'}
        </Text>
      ) : null}

      {!loading && !loadError && visibleProducts.length > 0 && (
        <ScrollView>
          {visibleProducts.map((product) => {
            const uri = firstImage(product);
            const stock = stockCount(product);
            return (
              <View key={product.id} style={styles.card}>
                <View style={styles.cardContent}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.cardImage} />
                  ) : (
                    <View style={[styles.cardImage, tailwind`bg-gray-200 items-center justify-center`]}>
                      <Icon name="image" size={24} color="#9ca3af" />
                    </View>
                  )}
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardTitle}>{product.name}</Text>
                    <Text style={styles.cardDescription}>{plainText(product.description ?? product.short_description)}</Text>
                    <Text style={styles.cardPrice}>{Number(product.base_price ?? product.price).toFixed(2)} Kz</Text>
                    <Text style={tailwind`text-xs ${stock > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                      {stock > 0 ? `Stock: ${stock}` : 'Esgotado'}
                    </Text>
                    {product.is_active === false && (
                      <Text style={tailwind`text-xs text-orange-600`}>Indisponível</Text>
                    )}
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(product)}>
                      <Icon name="edit" size={20} color="green" />
                    </TouchableOpacity>
                    {product.id != null && (
                      <TouchableOpacity onPress={() => handleDeleteProduct(product.id as number)} style={tailwind`ml-4`}>
                        <Icon name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={tailwind`text-2xl font-bold mb-4`}>
              {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </Text>
            <ScrollView>
              <View style={tailwind`mb-4 z-10`}>
                <Text style={tailwind`mb-2`}>Categoria</Text>
                <DropDownPicker
                  open={open}
                  value={formCategory}
                  items={categorias.map((cat) => ({ label: cat.name, value: cat.id.toString() }))}
                  setOpen={setOpen}
                  setValue={setFormCategory}
                  placeholder="Selecione uma categoria"
                  searchable={true}
                  searchPlaceholder="Digite para pesquisar..."
                  listMode="SCROLLVIEW"
                  style={tailwind`w-full p-2 border rounded`}
                />
              </View>
              <View style={tailwind`mb-4`}>
                <Text style={tailwind`mb-2`}>Nome</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextInput style={tailwind`w-full p-2 border rounded`} onChangeText={onChange} value={value} />
                  )}
                  name="name"
                  rules={{ required: true }}
                />
                {errors.name && <Text style={tailwind`text-red-500`}>Nome é obrigatório</Text>}
              </View>
              <View style={tailwind`mb-4`}>
                <Text style={tailwind`mb-2`}>Pequena Descrição</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextInput style={tailwind`w-full p-2 border rounded`} onChangeText={onChange} value={value} />
                  )}
                  name="short_description"
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
                {previewImage && (
                  <View style={tailwind`mt-4`}>
                    <Image source={{ uri: previewImage }} style={styles.imagePreview} />
                  </View>
                )}
              </View>
              <View style={tailwind`mb-4`}>
                <Text style={tailwind`mb-2`}>Preço (Kz)</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextInput keyboardType="numeric" style={tailwind`w-full p-2 border rounded`} onChangeText={onChange} value={value} />
                  )}
                  name="price"
                  rules={{ required: true }}
                />
                {errors.price && <Text style={tailwind`text-red-500`}>Preço é obrigatório</Text>}
              </View>
              <View style={tailwind`mb-4`}>
                <Text style={tailwind`mb-2`}>Stock (unidades disponíveis)</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextInput keyboardType="number-pad" style={tailwind`w-full p-2 border rounded`} onChangeText={onChange} value={value} />
                  )}
                  name="stock"
                  rules={{ required: true }}
                />
                {errors.stock && <Text style={tailwind`text-red-500`}>Stock é obrigatório</Text>}
              </View>
              <View style={tailwind`mb-4 flex-row items-center justify-between`}>
                <Text>Disponível para encomenda</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Switch value={value} onValueChange={onChange} />
                  )}
                  name="is_active"
                />
              </View>
              {formError ? <Text style={tailwind`text-red-600 mb-2`}>{formError}</Text> : null}
              <View style={tailwind`flex flex-row justify-between mt-4`}>
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={saving}
                  style={tailwind`px-4 py-2 rounded ${saving ? 'bg-green-300' : 'bg-green-500'}`}
                >
                  <Text style={tailwind`text-white`}>{saving ? 'A guardar...' : editingProduct ? 'Atualizar' : 'Salvar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal} style={tailwind`px-4 py-2 bg-red-500 rounded`}>
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
  chipRow: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 8,
  },
  chipRowContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
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
    maxHeight: '90%',
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
