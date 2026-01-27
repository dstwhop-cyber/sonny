
import { userRegistryService } from './userRegistryService';
import { PlanType } from '../types';

export const paymentService = {
  // Simulate Webhook Handling (In real apps, this is a POST endpoint on your server)
  handlePaddleWebhook: (userId: string, event: 'subscription.created' | 'subscription.cancelled', plan: PlanType, subId: string) => {
    if (event === 'subscription.created') {
      userRegistryService.updateUserStatus(userId, { plan, subId });
      userRegistryService.addLog({
        level: 'info',
        message: `Payment Success: User ${userId} upgraded to ${plan}`,
        userId
      });
    } else {
      userRegistryService.updateUserStatus(userId, { plan: 'free', subId: undefined });
      userRegistryService.addLog({
        level: 'warning',
        message: `Subscription Cancelled: User ${userId}`,
        userId
      });
    }
  }
};
