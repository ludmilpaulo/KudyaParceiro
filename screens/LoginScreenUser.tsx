// screens/LoginScreenUser.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { loginUserService } from '../services/authService';
import { loginUser } from '../redux/slices/authSlice';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { RootStackParamList } from '../services/types';


const LoginScreenUser = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const toggleForgotPasswordModal = () => {
    setShowForgotPasswordModal(prev => !prev);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await loginUserService(username, password);
      console.log('Response received:', response);
      dispatch(loginUser(response)); // Assume loginUser action updates the Redux state accordingly
      Alert.alert('Sucesso', 'Você se conectou com sucesso!');

      console.log('is_customer:', response.is_customer);
      console.log('is_driver:', response.is_driver);

      // Navigate based on the response
      if (response.is_driver) {
        navigation.navigate('HomeNavigator');
      } else if (!response.is_customer && !response.is_driver) {
        navigation.navigate('RestaurantDrawer');
      } else {
        // Default or other role navigation if necessary
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Falha ao entrar. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -100 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.formContainer}
      >
        <View style={styles.imageContainer}>
          <Image source={require('../assets/azul.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Faça login na sua conta</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
          <Text style={styles.signupLink}>
            Não tem uma conta? <Text style={styles.signupText}>Cadastre-se aqui</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder='Nome do usuário'
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            value={password}
            placeholder='Digite sua senha'
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            {showPassword ? <EyeOff width={20} height={20} color='#040405' /> : <Eye width={20} height={20} color='#040405' />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={toggleForgotPasswordModal}>
          <Text style={styles.forgotPasswordLink}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={styles.loginButton} disabled={loading}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </MotiView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size='large' color='#FFFFFF' />
        </View>
      )}
      <ForgotPasswordModal show={showForgotPasswordModal} onClose={toggleForgotPasswordModal} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowOffset: { height: 0, width: 0 },
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  signupLink: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  signupText: {
    color: '#0077cc',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
    padding: 10,
  },
  forgotPasswordLink: {
    textAlign: 'right',
    color: '#0077cc',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#0077cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreenUser;
