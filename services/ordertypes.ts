// Define types for the nested structures within the order response

export interface Customer {
    id: number;
    name: string;
    avatar: string;
    phone: string;
    address: string;
    location:string;
  }
  
  export interface Restaurant {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    location: string; // Added location field
  }
  
  export interface Meal {
    id: number;
    name: string;
    price: string;
  }
  
  export interface OrderDetail {
    id: number;
    meal: Meal;
    quantity: number;
    sub_total: string;
  }
  
  export interface UserOrder {
    id: number;
    customer: Customer;
    restaurant: Restaurant;
    driver: any; // or you can define a Driver type if you have it
    order_details: OrderDetail[];
    total: string;
    status: string;
    address: string;
    invoice_pdf: string;
    created_at: string;
    secret_pin: string;
    picked_at: string | null;
  }
  
  // Define the overall structure for the order response
  
  export interface OrderResponse {
    orders: UserOrder[];
  }
  