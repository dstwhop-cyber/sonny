
import { userRegistryService } from './userRegistryService';
import { PlanType } from '../types';

export const paymentService = {
  // Corrected to async handlePaddleWebhook and use updateUserStatus
  handlePaddleWebhook: async (userId: string, event: 'subscription.created' | 'subscription.cancelled', plan: PlanType, subId: string) => {
    if (event === 'subscription.created') {
      await userRegistryService.updateUserStatus(userId, { plan, subId, subStatus: 'active' });
      userRegistryService.addLog({
        level: 'info',
        message: `Payment Success: User ${userId} upgraded to ${plan}`,
        userId
      });
    } else {
      await userRegistryService.updateUserStatus(userId, { plan: 'free', subId: undefined, subStatus: 'none' });
      userRegistryService.addLog({
        level: 'warning',
        message: `Subscription Cancelled: User ${userId}`,
        userId
      });
    }
  }
};
