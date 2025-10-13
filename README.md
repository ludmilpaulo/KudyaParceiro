# Kudya Parceiro - Partner & Driver App

React Native mobile application for store owners and delivery drivers to manage their business on the Kudya platform.

## Overview

This is the partner-facing mobile application for the Kudya platform. It enables store owners to manage their stores, products, and orders, while delivery drivers can accept and fulfill deliveries.

## Features

### For Store Owners
- 🏪 Store profile management
- 📦 Product catalog management (add, edit, delete)
- 📋 Order management and tracking
- 📊 Sales analytics and reports
- ⏰ Opening hours configuration
- 💰 Earnings tracking
- 📸 Image upload for products
- 🔔 Real-time order notifications

### For Delivery Drivers
- 📍 Real-time location tracking
- 🚗 Accept/reject delivery requests
- 🗺️ Navigation to pickup and delivery locations
- 💵 Earnings tracking
- 📊 Delivery history
- 🔔 Push notifications for new orders

## Tech Stack

- **Framework**: React Native 0.79.2
- **Platform**: Expo SDK 53
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 7
- **UI Components**: React Native Paper, Moti
- **Maps**: React Native Maps
- **Forms**: React Hook Form
- **Charts**: React Native Chart Kit
- **API Client**: Axios

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio
- Expo Go app on your physical device (optional)

## Installation

1. **Clone the repository**:
```bash
git clone https://github.com/ludmilpaulo/KudyaParceiro.git
cd KudyaParceiro
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- API URL (backend server)
- Google Maps API key

4. **Update API configuration**:
Edit `services/types.ts` to point to your backend:
```typescript
export const baseAPI: string = "https://kudya.pythonanywhere.com";
```

## Running the App

### Development Mode

```bash
# Start Expo development server
npm start
# or
expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

### Platform-specific

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Configure EAS**:
```bash
eas build:configure
```

3. **Build**:
```bash
# For iOS
eas build --platform ios

# For Android
eas build --platform android

# For both
eas build --platform all
```

## Project Structure

```
KudyaParceiro/
├── assets/          # Images, fonts, static assets
├── components/      # Reusable UI components
├── navigation/      # Navigation setup
├── redux/           # Redux store and slices
├── screens/         # App screens
│   ├── auth/        # Login/signup screens
│   ├── store/       # Store management screens
│   ├── driver/      # Driver screens
│   └── shared/      # Shared screens
├── services/        # API services
│   ├── apiService.ts     # Store API calls
│   ├── authService.ts    # Authentication
│   ├── driverService.ts  # Driver operations
│   └── types.ts          # TypeScript types
├── utils/           # Utility functions
├── App.tsx          # App entry point
└── package.json     # Dependencies
```

## Integration with Backend

This app connects to the Kudya Django REST API:
- **Backend Repository**: [www_kudya_shop](https://github.com/ludmilpaulo/www_kudya_shop)
- **API Base URL**: `https://kudya.pythonanywhere.com`

### Key API Endpoints Used

#### For Store Owners
- `/restaurant/get_fornecedor/` - Get store details
- `/restaurant/restaurants/{id}/` - Update store
- `/restaurant/add-product/` - Add product
- `/restaurant/update-product/{id}/` - Update product
- `/restaurant/delete-product/{id}/` - Delete product
- `/restaurant/restaurant/orders/` - Get orders
- `/restaurant/restaurant/status/` - Update order status
- `/restaurant/meal-categories/` - Get product categories

#### For Drivers
- `/driver/` - Driver profile
- `/driver/orders/` - Available orders
- `/driver/update-location/` - Update location
- `/order/{id}/status/` - Update delivery status

## User Roles

The app supports two main user types:

1. **Store Owner (Parceiro)**
   - Manage store profile
   - Add/edit/delete products
   - Process orders
   - View analytics

2. **Delivery Driver (Entregador)**
   - Accept delivery requests
   - Navigate to locations
   - Update delivery status
   - Track earnings

## Configuration

### Google Maps API

Add your API key in `services/apiService.ts`:
```typescript
export const googleAPi = "YOUR_GOOGLE_MAPS_API_KEY";
```

### Push Notifications

Configure Expo push notifications for order alerts.

## Related Projects

Part of the Kudya ecosystem:

1. **[www_kudya_shop](https://github.com/ludmilpaulo/www_kudya_shop)** - Django REST API Backend
2. **[food_deliver](https://github.com/ludmilpaulo/food_deliver)** - Next.js Web App (Customer)
3. **[kudya-client](https://github.com/ludmilpaulo/kudya-client)** - Customer Mobile App

## Troubleshooting

### Clear cache
```bash
npm start -- --reset-cache
```

### Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

### Check Expo health
```bash
expo doctor
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

Copyright © 2025 Kudya. All rights reserved.

## Support

For support, email: ludmilpaulo@gmail.com

## Links

- **Website**: https://www.sdkudya.com
- **Backend API**: https://kudya.pythonanywhere.com
