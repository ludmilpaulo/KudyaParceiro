//export const baseAPI: string = "http://127.0.0.1:8000";
export const baseAPI: string = "https://www.kudya.shop";

//export const baseAPI: string = "http://192.168.1.108:8000";






import { ReactNode } from "react";

export type UserDetails = {
    // customer_detais: string;
    address: string;
    avatar: string;
    id: number;
    phone: number;
  };
  
  export type FornecedorType = {
    id: number;
    user: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    licenca: string;
    aprovado: boolean;
    criado_em: string;
    modificado_em: string;
    children: ReactNode;
  };
  
  
  export interface OrderTypes {
    id: number;
    order_details: {
      id: number;
      meal: {
        name: string;
        price: number;
      };
      quantity: number;
      sub_total: number;
    }[];
    customer: {
      name: string;
    };
    driver: {
      name: string;
    };
    total: number;
    status: string;
  }

  export interface ImageType {
    uri: string;
    name?: string;
    type?: string;
  }
  

  

  export type Product = {
    user_id?: number;
    id?: number;
    name: string;
    short_description: string;
    image?: ImageType[]; // Ensure image is an array of ImageType
   // image: string;
    price: string;
    category: string | number;
    // Add other fields if necessary...
  };
  
 // @/services/types.ts

export type OpeningHour = {
    day: string;
    from_hour: string;
    to_hour: string;
    is_closed: boolean;
  };
  
  export type Category = {
    id: number;
    name: string;
    image: string | null;
  };

  export interface RestaurantJoin {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category: {
      id: number;
      name: string;
      image: string | null;
    };
    barnner: boolean;
    is_approved: boolean;
    location: {
      latitude: number;
      longitude: number;
    };
    opening_hours: {
      day: string;
      from_hour: string;
      to_hour: string;
      is_closed: boolean;
    }[];
  }
  
  export type Restaurant = {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: Category;
    barnner: boolean;
    is_approved: boolean;
    location: string;
    opening_hours: OpeningHour[];
  };

  export type Categoria = {
    id: number;
    name: string;
    slug: string;
  };


  export interface OpeningHourType {
    id?: number;
    restaurant: number;
    day: number;
    from_hour: string;
    to_hour: string;
    is_closed: boolean;
  }
  
  
  


  export type CategoryType = {
    id: number;
    name: string;
    image: string | null;
  };
  
  export type RestaurantType = {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: CategoryType;
    barnner: boolean;
    is_approved: boolean;
    opening_hours: OpeningHourType[];
  };


  export interface AboutUsData {
    id: number;
    title: string;
    logo: string;
    back: string;
    backgroundApp: string;
    backgroundImage: string;
    bottomImage: string;
    about: string;
    born_date: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    linkedin: string | null;
    facebook: string;
    twitter: string;
    instagram: string;
  }


  // types.ts
export interface Career {
  id: number;
  title: string;
  description: string;
}

export interface JobApplication {
  career: number;
  full_name: string;
  email: string;
  resume: File | null;
}

///////////////////////////////////////////

export interface UserOrder {
  id: number;
  customer: {
    id: number;
    name: string;
    avatar: string | null;
    phone: string;
    address: string;
  };
  restaurant: {
    id: number;
    name: string;
    phone: string;
    address: string;
  };
  driver: any; // You might want to define a proper type for the 'driver' field
  order_details: {
    id: number;
    meal: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
    sub_total: number;
  }[];
  total: number;
  status: string;
  address: string;
}

export interface Customer {
  id: number;
  name: string;
  avatar: string | null;
  phone: string;
  address: string;
}

export interface Meal {
  id: number;
  name: string;
  price: number;
}

export interface OrderDetail {
  id: number;
  meal: Meal;
  quantity: number;
  sub_total: number;
}

export interface Order {
  id: number;
  customer: Customer;
  restaurant: Restaurant;
  driver: any; // You might want to define a proper type for the 'driver' field
  order_details: OrderDetail[];
  total: number;
  status: string;
  address: string;
}


// types/navigation.ts
export type RootStackParamList = {
  AuthNavigator: undefined;
  HomeNavigator: undefined;
  RestaurantDrawer: undefined;
  LoginScreenUser: undefined;
  SignupScreen: undefined;
  ParceiroDashboard: undefined;
  EntregadorDashboard: undefined;
  RestaurantDashboard: undefined;
  UserProfile: undefined;
  RestaurantMap: undefined;
  CustomerDelivery: undefined;
  HomeScreen:undefined;
};

