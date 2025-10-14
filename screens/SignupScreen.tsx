import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet, ImageStyle, ViewStyle, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "react-native-feather";
import { signup } from "../services/authService";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from 'moti';
import { loginUser } from "../redux/slices/authSlice"; // Ensure correct path
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export interface SignupData {
  username: string;
  email: string;
  password: string;
  password2?: string;
  name?: string;
  phone?: string;
  address?: string;
  category_id?: number;
  logo?: {
    uri: string;
    type: string;
    name: string;
  };
  restaurant_license?: {
    uri: string;
    type: string;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [signupData, setSignupData] = useState<SignupData>({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'restaurant' | 'entregador' | 'parceiro'>('restaurant');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get('https://www.kudya.shop/store/store-categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (name: 'logo' | 'restaurant_license') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = {
        uri: result.assets[0].uri,
        type: result.assets[0].type || 'image/jpeg',
        name: result.assets[0].fileName || 'image.jpg',
      };
      setSignupData(prev => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validate category selection for parceiro role
    if (role === 'parceiro' && !selectedCategory) {
      Alert.alert("Categoria Necessária", "Por favor, selecione uma categoria para continuar.");
      return;
    }
    
    setLoading(true);
    try {
      const dataToSend = { 
        ...signupData, 
        password2: signupData.password,
        category_id: selectedCategory || undefined
      };
      const { status, data } = await signup(role, dataToSend);
      console.log("Received", data);

      if (status === 200 || status === 201) {
        dispatch(loginUser(data));
        Alert.alert("Sucesso", "Você se cadastrou com sucesso.");
        navigation.navigate(role === 'restaurant' ? 'RestaurantDashboard' : role === 'entregador' ? 'EntregadorDashboard' : 'ParceiroDashboard');
      } else {
        Alert.alert("Falha no Cadastro", data.message || "Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  const getRoleButtonStyle = (selected: boolean): ViewStyle => ({
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: selected ? '#0077cc' : '#ccc',
    backgroundColor: selected ? '#0077cc' : '#fff',
    borderRadius: 5,
    alignItems: 'center',
  });

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MotiView
          from={{ opacity: 0, translateY: -100 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.formContainer}
        >
          <View style={styles.imageContainer}>
            <Image source={require("../assets/azul.png")} style={styles.logo} />
          </View>
          <Text style={styles.title}>Crie sua conta</Text>
          <TouchableOpacity onPress={() => navigation.navigate("UserLogin")}>
            <Text style={styles.signupLink}>
              Já tem uma conta?{" "}
              <Text style={styles.signupText}>Faça login aqui</Text>
            </Text>
          </TouchableOpacity>
          <View style={styles.roleSelection}>
            <TouchableOpacity onPress={() => setRole('restaurant')} style={getRoleButtonStyle(role === 'restaurant')}>
              <Text style={styles.roleButtonText}>Restaurante</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRole('entregador')} style={getRoleButtonStyle(role === 'entregador')}>
              <Text style={styles.roleButtonText}>Entregador</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRole('parceiro')} style={getRoleButtonStyle(role === 'parceiro')}>
              <Text style={styles.roleButtonText}>Parceiro</Text>
            </TouchableOpacity>
          </View>

          {/* Category Selection for Parceiro */}
          {role === 'parceiro' && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Selecione sua Categoria de Serviço:</Text>
              {loadingCategories ? (
                <ActivityIndicator size="small" color="#0077cc" />
              ) : (
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      style={[
                        styles.categoryCard,
                        selectedCategory === category.id && styles.categoryCardSelected
                      ]}
                    >
                      <Text style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.categoryTextSelected
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nome de usuário"
              value={signupData.username}
              onChangeText={text => handleInputChange('username', text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={signupData.email}
              onChangeText={text => handleInputChange('email', text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Senha"
              value={signupData.password}
              onChangeText={text => handleInputChange('password', text)}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              {showPassword ? <EyeOff width={20} height={20} color="#040405" /> : <Eye width={20} height={20} color="#040405" />}
            </TouchableOpacity>
          </View>
          {role === 'restaurant' && (
            <>
              <TouchableOpacity
                style={styles.fileButton}
                onPress={() => handleFileChange('logo')}
              >
                <Text style={styles.fileButtonText}>Selecionar Logo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fileButton}
                onPress={() => handleFileChange('restaurant_license')}
              >
                <Text style={styles.fileButtonText}>Selecionar Licença do Restaurante</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={handleSubmit} style={styles.signupButton} disabled={loading}>
            <Text style={styles.signupButtonText}>Inscreva-se</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  categorySection: {
    marginBottom: 20,
    width: '100%',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  categoryCardSelected: {
    borderColor: '#0077cc',
    backgroundColor: '#e6f2ff',
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#0077cc',
    fontWeight: 'bold',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 100,
    height: 100
  } as ImageStyle,
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  signupLink: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20
  },
  signupText: {
    color: '#0077cc',
    textDecorationLine: 'underline'
  },
  inputContainer: {
    marginBottom: 10
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%'
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
    padding: 10
  },
  roleSelection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButtonText: {
    color: '#000',
  },
  fileButton: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  fileButtonText: {
    color: '#0077cc',
  },
  signupButton: {
    backgroundColor: '#0077cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default SignupScreen;
