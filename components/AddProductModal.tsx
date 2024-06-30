import React from "react";
import { useForm } from "react-hook-form";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native";
import tailwind from "twrnc";
import { Categoria, Product } from "../services/types";

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
  const { register, handleSubmit } = useForm<Product>();


  if (!isAddModalOpen) return null;

  return (
    <Modal
      visible={isAddModalOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsAddModalOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={tailwind`w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg`}>
          <Text style={tailwind`text-2xl font-bold mb-4`}>Adicionar Produto</Text>
          <ScrollView>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Nome</Text>
              <TextInput
                {...register("name", { required: true })}
                style={tailwind`w-full p-2 border rounded`}
              />
              {errors.name && <Text style={tailwind`text-red-500`}>Nome é obrigatório</Text>}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Pequena Descrição</Text>
              <TextInput
                {...register("short_description", { required: true })}
                style={tailwind`w-full p-2 border rounded`}
              />
              {errors.short_description && <Text style={tailwind`text-red-500`}>Descrição curta é obrigatória</Text>}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Imagem</Text>
              <TextInput
                {...register("image", { required: true })}
                style={tailwind`w-full p-2 border rounded`}
              />
              {errors.image && <Text style={tailwind`text-red-500`}>Imagem é obrigatória</Text>}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Preço</Text>
              <TextInput
                keyboardType="numeric"
                {...register("price", { required: true })}
                style={tailwind`w-full p-2 border rounded`}
              />
              {errors.price && <Text style={tailwind`text-red-500`}>Preço é obrigatório</Text>}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`block mb-2`}>Categoria</Text>
              <View style={tailwind`relative`}>
                <TextInput
                  style={tailwind`w-full p-2 border rounded`}
                  value={selectedCategory}
                  onChangeText={setSelectedCategory}
                />
                <View style={tailwind`absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60`}>
                  {categorias.map((categoria) => (
                    <TouchableOpacity key={categoria.id} onPress={() => setSelectedCategory(categoria.name)}>
                      <View style={tailwind`cursor-pointer select-none relative py-2 pl-10 pr-4 ${selectedCategory === categoria.name ? 'bg-blue-600 text-white' : 'text-gray-900'} ${selectedCategory === categoria.name ? 'font-medium' : 'font-normal'}`}>
                        <Text>{categoria.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {errors.category && <Text style={tailwind`text-red-500`}>Categoria é obrigatória</Text>}
            </View>
            <View style={tailwind`flex justify-end`}>
              <TouchableOpacity onPress={handleSubmit(onSubmit)} style={tailwind`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600`}>
                <Text style={tailwind`text-white`}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} style={tailwind`px-4 py-2 ml-4 bg-red-500 text-white rounded hover:bg-red-600`}>
                <Text style={tailwind`text-white`}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
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
});

export default AddProductModal;
