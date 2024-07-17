import { SignupData } from '../screens/SignupScreen';
import { baseAPI } from './types';

export const signup = async (role: string, data: SignupData) => {
  let endpoint = '';

  switch (role) {
    case 'restaurant':
      endpoint = `${baseAPI}/restaurant/fornecedor/`;
      break;
    case 'entregador':
      endpoint = `${baseAPI}/driver/signup/driver/`;
      break;
    case 'parceiro':
      endpoint = `${baseAPI}/customer/signup/`;
      break;
    default:
      throw new Error('Role inválido');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  return {
    status: response.status,
    data: responseData,
  };
};




export const loginUserService = async (username: string, password: string) => {
  const response = await fetch(`${baseAPI}/conta/login/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const responseData = await response.json();
  console.log("response data", responseData)

  if (!response.ok) {
    throw new Error(responseData.message || 'Falha ao entrar. Por favor, tente novamente.');
  }

  return responseData;
};
