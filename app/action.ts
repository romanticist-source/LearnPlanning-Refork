"use server";

import webpush from "web-push";
import type { PushSubscription } from "web-push";
import { auth } from "@/app/api/auth/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005';

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscriptionJSON) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // ユーザー情報を取得
    const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`);
    const users = await userResponse.json();
    const currentUser = users[0];

    if (!currentUser) {
      throw new Error("User not found");
    }

    // PushSubscriptionJSON を PushSubscription 形式に変換
    const pushSubscription: PushSubscription = {
      endpoint: sub.endpoint!,
      keys: {
        p256dh: sub.keys!.p256dh!,
        auth: sub.keys!.auth!
      }
    };

    // 既存のサブスクリプションをチェック
    const existingSubResponse = await fetch(`${API_BASE_URL}/push_subscriptions?userId=${currentUser.id}`);
    const existingSubscriptions = existingSubResponse.ok ? await existingSubResponse.json() : [];

    if (existingSubscriptions.length > 0) {
      // 既存のサブスクリプションを更新
      const updateResponse = await fetch(`${API_BASE_URL}/push_subscriptions/${existingSubscriptions[0].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...existingSubscriptions[0],
          subscription: pushSubscription,
          updatedAt: new Date().toISOString()
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update subscription');
      }
    } else {
      // 新しいサブスクリプションを作成
      const newSubscription = {
        id: `sub-${Date.now()}`,
        userId: currentUser.id,
        subscription: pushSubscription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const createResponse = await fetch(`${API_BASE_URL}/push_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubscription),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create subscription');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error subscribing user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function unsubscribeUser() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // ユーザー情報を取得
    const userResponse = await fetch(`${API_BASE_URL}/users?email=${session.user.email}`);
    const users = await userResponse.json();
    const currentUser = users[0];

    if (!currentUser) {
      throw new Error("User not found");
    }

    // サブスクリプションを削除
    const subscriptionsResponse = await fetch(`${API_BASE_URL}/push_subscriptions?userId=${currentUser.id}`);
    const subscriptions = subscriptionsResponse.ok ? await subscriptionsResponse.json() : [];

    for (const subscription of subscriptions) {
      await fetch(`${API_BASE_URL}/push_subscriptions/${subscription.id}`, {
        method: 'DELETE',
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendNotificationToUser(userId: string, title: string, body: string, data?: any) {
  try {
    // ユーザーのサブスクリプションを取得
    const subscriptionsResponse = await fetch(`${API_BASE_URL}/push_subscriptions?userId=${userId}`);
    const subscriptions = subscriptionsResponse.ok ? await subscriptionsResponse.json() : [];

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${userId}`);
      return { success: true, message: 'No subscriptions to send to' };
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: "/icon-192x192.png",
      badge: "/badge.png",
      data: data ?? {}
    });

    // 全てのサブスクリプションに通知を送信
    const sendPromises = subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(sub.subscription, notificationPayload);
        return { success: true, subscriptionId: sub.id };
      } catch (error) {
        console.error(`Failed to send notification to subscription ${sub.id}:`, error);
        return { success: false, subscriptionId: sub.id, error };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    
    return { 
      success: true, 
      message: `Notification sent to ${successCount}/${subscriptions.length} subscriptions`,
      results 
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendNotification(message: string) {
  // 後方互換性のための関数（既存コードで使用されている場合）
  console.warn('sendNotification is deprecated, use sendNotificationToUser instead');
  return { success: false, error: 'This function is deprecated' };
}
