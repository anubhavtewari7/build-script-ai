
import { SubscriptionTier } from "../types";

/**
 * PRODUCTION NOTE:
 * To go live, you would replace the logic in this service with real Stripe/PayPal API calls.
 * 1. Install Stripe: npm install @stripe/stripe-js
 * 2. Replace handleMockPayment with a real Stripe session or payment intent.
 */

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
}

export const paymentService = {
  /**
   * Simulates an external payment gateway transaction.
   * In a real app, this would return a transaction ID or error.
   */
  processTransaction: async (tier: SubscriptionTier, details: PaymentDetails): Promise<boolean> => {
    console.log(`[PAYMENT GATEWAY] Initiating $ transaction for ${tier} tier...`);
    
    // Simulate network latency
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock validation: Just ensure fields aren't empty
        const success = !!(details.name && details.cardNumber.length >= 13);
        console.log(`[PAYMENT GATEWAY] Transaction ${success ? 'Approved' : 'Declined'}`);
        resolve(success);
      }, 2800);
    });
  }
};
