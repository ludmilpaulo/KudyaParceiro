# Mixpanel Integration Test Guide - Partner App (KudyaParceiro)

## Overview
This guide helps you test the Mixpanel integration in the Kudya partner mobile app for drivers and restaurant owners (React Native).

## Configuration
- **Token**: `a8cf933c3054afed7f397f71249ba506`
- **SDK**: `mixpanel-react-native` v3.1.2
- **Features**: Automatic events enabled

## Test Scenarios

### 1. App Launch
1. Open the app
2. **Expected Event**: `App Opened`
3. Verify in Mixpanel Live View

### 2. Partner Authentication

#### Login Test
1. Navigate to Login Screen
2. **Expected Event**: `Screen View` with screen = "Partner Login Screen"
3. Login as driver or restaurant
4. **Expected Events**:
   - Success: `User Login` with user_type = "driver" or "restaurant", platform = "partner-mobile"
   - Failure: `Error Occurred` with error_message = "Partner Login Failed"

#### Signup Test
1. Navigate to Signup Screen
2. Complete partner registration
3. **Expected Events**:
   - `Categories Fetch Started`
   - `Categories Loaded` with count
   - `Signup Attempt` with role, has_category
   - Success: `User Signup` with username, email, role, category_id
   - Failure: Various error events

### 3. Driver Flow

#### Dashboard
1. Login as driver
2. Navigate to Driver Dashboard
3. Toggle online status
4. **Expected Events**:
   - Orders fetched
   - Location updates tracked

#### Order Management
1. Wait for new orders
2. **Expected Event**: `New Orders Available` with order_count, user_type = "driver"
3. Accept/Reject orders
4. **Expected Events**: Track order status changes

### 4. Restaurant Flow

#### Restaurant Dashboard
1. Login as restaurant owner
2. Access restaurant dashboard
3. Manage orders and products
4. Track revenue

## Testing on Different Platforms

### iOS Testing
```bash
cd /Users/ludmil/Desktop/Apps/KudyaParceiro
expo start --ios
```

### Android Testing
```bash
cd /Users/ludmil/Desktop/Apps/KudyaParceiro
expo start --android
```

## Driver-Specific Events

### Location Tracking
- Driver location updates
- Proximity to restaurants
- Delivery route tracking

### Order Events
- `New Orders Available`: When orders appear
- `Order Accepted`: Driver accepts order
- `Order Rejected`: Driver rejects order
- `Order Completed`: Delivery completed
- `Order Status Updated`: Status changes

### Error Tracking
- `Driver Orders Fetch Failed`: API errors
- Login/signup failures
- Category loading issues

## Restaurant-Specific Events

### Product Management
- Product additions
- Product updates
- Inventory changes

### Order Management
- Order received
- Order prepared
- Order ready for pickup

## Verification Steps

### Real-Time Testing
1. Open Mixpanel Live View
2. Perform actions in the app
3. Watch events appear in real-time
4. Verify all properties are correct

### User Profiles
1. Check Mixpanel People section
2. Verify driver/restaurant profiles
3. Confirm user properties are set:
   - User type (driver/restaurant)
   - Platform (partner-mobile)
   - Registration details

### Funnel Analysis
1. Track signup → login → first order flow
2. Monitor driver acceptance rates
3. Analyze order completion times

## Event Properties to Verify

### Partner User Properties
- `user_type`: "driver" or "restaurant"
- `platform`: "partner-mobile"
- Login/signup timestamps
- Role-specific properties

### Driver Events
- `order_count`: Number of available orders
- `location`: GPS coordinates
- `distance`: Distance to restaurant
- `status`: Online/offline

### Restaurant Events
- `category_id`: Store category
- `order_status`: Various states
- `revenue`: Financial data

## Common Issues

### Location Tracking
- Ensure location permissions granted
- Check GPS is enabled
- Verify location updates in background

### Order Notifications
- Test push notification permissions
- Verify sound plays on new orders
- Check vibration feedback

### Category Loading
- Verify API endpoint is accessible
- Check network connectivity
- Monitor for loading errors

## Success Criteria
✅ App launch tracked
✅ Partner login/signup events captured
✅ Driver status changes recorded
✅ Order notifications tracked
✅ Location updates logged
✅ Restaurant operations tracked
✅ Error events captured with details
✅ User profiles created correctly
✅ Both iOS and Android working

## Analytics Methods Available

```typescript
// Authentication
analytics.trackLogin(userId, { user_type, platform })
analytics.trackSignup(userId, { username, email, role, category_id })

// Screen tracking
analytics.trackScreenView(screenName, properties?)

// Order management (Partner-specific)
analytics.track('New Orders Available', { order_count, user_type })
analytics.trackOrderAccepted(orderId)
analytics.trackOrderRejected(orderId, reason?)
analytics.trackOrderCompleted(orderId, orderValue)
analytics.trackOrderStatusUpdate(orderId, status)

// Location tracking
analytics.trackLocationUpdate(latitude, longitude)

// Error tracking
analytics.trackError(error, errorDetails?)

// Category tracking
analytics.track('Categories Fetch Started')
analytics.track('Categories Loaded', { count })
analytics.trackError('Categories Load Failed', { error })
```

## Testing Checklist

### Driver Testing
- [ ] Install app on device
- [ ] Complete driver signup
- [ ] Login as driver
- [ ] Go online
- [ ] Receive order notification
- [ ] Accept/reject orders
- [ ] Complete delivery
- [ ] Verify all events in Mixpanel

### Restaurant Testing
- [ ] Complete restaurant signup
- [ ] Select category
- [ ] Login as restaurant
- [ ] Manage products
- [ ] Receive orders
- [ ] Update order status
- [ ] Verify events tracked

### Cross-Platform
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Verify events from both platforms
- [ ] Check user identification works
- [ ] Confirm properties are correct

## Debug Tips

1. **Enable Logging**: Mixpanel is initialized with debug mode
2. **Check Console**: Look for Mixpanel-related logs
3. **Network Tab**: Monitor API calls to Mixpanel
4. **Live View**: Use Mixpanel dashboard for real-time debugging

## Support

If you encounter issues:
1. Check Mixpanel token is correct
2. Verify SDK is properly initialized
3. Ensure network connectivity
4. Check app permissions (location, notifications)
5. Review error logs in console

