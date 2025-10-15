// Mixpanel Analytics Configuration for React Native
import { Mixpanel } from 'mixpanel-react-native';

// Initialize Mixpanel with your token
const MIXPANEL_TOKEN = 'a8cf933c3054afed7f397f71249ba506';

// Create Mixpanel instance
const mixpanel = new Mixpanel(MIXPANEL_TOKEN, true); // true enables automatic events

// Initialize Mixpanel
mixpanel.init();

// Analytics class for tracking events
class Analytics {
  private mixpanelInstance: Mixpanel;

  constructor() {
    this.mixpanelInstance = mixpanel;
  }

  // Track events
  track(eventName: string, properties?: Record<string, any>) {
    this.mixpanelInstance.track(eventName, properties);
  }

  // Identify user
  identify(userId: string) {
    this.mixpanelInstance.identify(userId);
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    this.mixpanelInstance.getPeople().set(properties);
  }

  // Track user signup
  trackSignup(userId: string, properties?: Record<string, any>) {
    this.identify(userId);
    this.track('User Signup', properties);
    this.setUserProperties({
      $name: properties?.name,
      $email: properties?.email,
      signup_date: new Date().toISOString(),
      ...properties,
    });
  }

  // Track user login
  trackLogin(userId: string, properties?: Record<string, any>) {
    this.identify(userId);
    this.track('User Login', properties);
  }

  // Track user logout
  trackLogout() {
    this.track('User Logout');
    this.mixpanelInstance.reset();
  }

  // Track screen views
  trackScreenView(screenName: string, properties?: Record<string, any>) {
    this.track('Screen View', {
      screen: screenName,
      ...properties,
    });
  }

  // Track order status update
  trackOrderStatusUpdate(orderId: string, status: string) {
    this.track('Order Status Updated', {
      order_id: orderId,
      status,
    });
  }

  // Track location update
  trackLocationUpdate(latitude: number, longitude: number) {
    this.track('Location Updated', {
      latitude,
      longitude,
    });
  }

  // Track product view
  trackProductView(productId: string, productName: string, properties?: Record<string, any>) {
    this.track('Product Viewed', {
      product_id: productId,
      product_name: productName,
      ...properties,
    });
  }

  // Track add to cart
  trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    this.track('Product Added to Cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      total: price * quantity,
    });
  }

  // Track order completed
  trackOrderCompleted(orderId: string, orderValue: number) {
    this.track('Order Completed', {
      order_id: orderId,
      order_value: orderValue,
    });
  }

  // Track order accepted (for partners)
  trackOrderAccepted(orderId: string) {
    this.track('Order Accepted', {
      order_id: orderId,
    });
  }

  // Track order rejected (for partners)
  trackOrderRejected(orderId: string, reason?: string) {
    this.track('Order Rejected', {
      order_id: orderId,
      reason,
    });
  }

  // Track help guide opened
  trackHelpGuideOpened(section?: string) {
    this.track('Help Guide Opened', {
      section,
    });
  }

  // Track category selected
  trackCategorySelected(categoryId: string, categoryName: string) {
    this.track('Category Selected', {
      category_id: categoryId,
      category_name: categoryName,
    });
  }

  // Track service booking
  trackServiceBooking(serviceId: string, serviceName: string, price: number) {
    this.track('Service Booked', {
      service_id: serviceId,
      service_name: serviceName,
      price,
    });
  }

  // Track notification received
  trackNotificationReceived(notificationType: string) {
    this.track('Notification Received', {
      notification_type: notificationType,
    });
  }

  // Track error
  trackError(error: string, errorDetails?: any) {
    this.track('Error Occurred', {
      error_message: error,
      error_details: errorDetails,
    });
  }

  // Set super properties (sent with every event)
  setSuperProperties(properties: Record<string, any>) {
    this.mixpanelInstance.registerSuperProperties(properties);
  }

  // Time an event
  timeEvent(eventName: string) {
    this.mixpanelInstance.timeEvent(eventName);
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export mixpanel instance for direct access if needed
export { mixpanel };

