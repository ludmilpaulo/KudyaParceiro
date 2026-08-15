// Mixpanel Analytics Configuration for React Native
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const MIXPANEL_TOKEN =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MIXPANEL_TOKEN?.trim()) ||
  '';

type MixpanelLike = {
  init: () => void;
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
  reset: () => void;
  registerSuperProperties: (properties: Record<string, unknown>) => void;
  timeEvent: (eventName: string) => void;
  getPeople: () => { set: (properties: Record<string, unknown>) => void };
};

let mixpanelInstance: MixpanelLike | null = null;
let initialized = false;

function getMixpanel(): MixpanelLike | null {
  if (!MIXPANEL_TOKEN) return null;
  if (mixpanelInstance) return mixpanelInstance;
  try {
    const { Mixpanel } = require('mixpanel-react-native') as {
      Mixpanel: new (
        token: string,
        trackAutomaticEvents: boolean,
        useNative?: boolean,
      ) => MixpanelLike;
    };
    const useNative = Constants.appOwnership !== 'expo' && Platform.OS !== 'web';
    mixpanelInstance = useNative
      ? new Mixpanel(MIXPANEL_TOKEN, true, true)
      : new Mixpanel(MIXPANEL_TOKEN, true, false);
    return mixpanelInstance;
  } catch {
    return null;
  }
}

function ensureInit() {
  if (initialized) return;
  const mp = getMixpanel();
  if (!mp) return;
  try {
    mp.init();
    initialized = true;
  } catch {
    // Native init can fail in Expo Go / simulator
  }
}

class Analytics {
  track(eventName: string, properties?: Record<string, unknown>) {
    ensureInit();
    getMixpanel()?.track(eventName, properties);
  }

  identify(userId: string) {
    ensureInit();
    getMixpanel()?.identify(userId);
  }

  setUserProperties(properties: Record<string, unknown>) {
    ensureInit();
    getMixpanel()?.getPeople().set(properties);
  }

  trackSignup(userId: string, properties?: Record<string, unknown>) {
    this.identify(userId);
    this.track('User Signup', properties);
    this.setUserProperties({
      $name: properties?.name,
      $email: properties?.email,
      signup_date: new Date().toISOString(),
      ...properties,
    });
  }

  trackLogin(userId: string, properties?: Record<string, unknown>) {
    this.identify(userId);
    this.track('User Login', properties);
  }

  trackLogout() {
    this.track('User Logout');
    getMixpanel()?.reset();
  }

  trackScreenView(screenName: string, properties?: Record<string, unknown>) {
    this.track('Screen View', {
      screen: screenName,
      ...properties,
    });
  }

  trackOrderStatusUpdate(orderId: string, status: string) {
    this.track('Order Status Updated', {
      order_id: orderId,
      status,
    });
  }

  trackLocationUpdate(latitude: number, longitude: number) {
    this.track('Location Updated', {
      latitude,
      longitude,
    });
  }

  trackProductView(productId: string, productName: string, properties?: Record<string, unknown>) {
    this.track('Product Viewed', {
      product_id: productId,
      product_name: productName,
      ...properties,
    });
  }

  trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    this.track('Product Added to Cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      total: price * quantity,
    });
  }

  trackOrderCompleted(orderId: string, orderValue: number) {
    this.track('Order Completed', {
      order_id: orderId,
      order_value: orderValue,
    });
  }

  trackOrderAccepted(orderId: string) {
    this.track('Order Accepted', {
      order_id: orderId,
    });
  }

  trackOrderRejected(orderId: string, reason?: string) {
    this.track('Order Rejected', {
      order_id: orderId,
      reason,
    });
  }

  trackHelpGuideOpened(section?: string) {
    this.track('Help Guide Opened', {
      section,
    });
  }

  trackCategorySelected(categoryId: string, categoryName: string) {
    this.track('Category Selected', {
      category_id: categoryId,
      category_name: categoryName,
    });
  }

  trackServiceBooking(serviceId: string, serviceName: string, price: number) {
    this.track('Service Booked', {
      service_id: serviceId,
      service_name: serviceName,
      price,
    });
  }

  trackNotificationReceived(notificationType: string) {
    this.track('Notification Received', {
      notification_type: notificationType,
    });
  }

  trackError(error: string, errorDetails?: unknown) {
    this.track('Error Occurred', {
      error_message: error,
      error_details: errorDetails,
    });
  }

  setSuperProperties(properties: Record<string, unknown>) {
    ensureInit();
    getMixpanel()?.registerSuperProperties(properties);
  }

  timeEvent(eventName: string) {
    ensureInit();
    getMixpanel()?.timeEvent(eventName);
  }
}

export const analytics = new Analytics();
export const mixpanel = {
  get instance() {
    return getMixpanel();
  },
};
