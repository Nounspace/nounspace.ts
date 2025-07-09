'use server'

import webpush from 'web-push'

const { NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env

if (!NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('VAPID keys are missing')
}

webpush.setVapidDetails(
  'mailto:willy@nounspace.com',
  NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

const subscriptions = new Map<string, PushSubscription>()

async function saveSubscriptionToDB(
  userId: string,
  sub: PushSubscription
): Promise<void> {
  // TODO: Persist the subscription to a database
  return Promise.resolve()
}

async function removeSubscriptionFromDB(userId: string): Promise<void> {
  // TODO: Remove the subscription from the database
  return Promise.resolve()
}

function isValidSubscription(sub: unknown): sub is PushSubscription {
  return (
    typeof sub === 'object' &&
    sub !== null &&
    typeof (sub as PushSubscription).endpoint === 'string'
  )
}

export async function subscribeUser(userId: string, sub: unknown) {
  if (!isValidSubscription(sub)) {
    return { success: false, error: 'Invalid subscription' }
  }

  const url = new URL(sub.endpoint)
  if (url.protocol !== 'https:') {
    return { success: false, error: 'Invalid subscription endpoint' }
  }

  subscriptions.set(userId, sub)
  await saveSubscriptionToDB(userId, sub)
  return { success: true }
}

export async function unsubscribeUser(userId: string) {
  subscriptions.delete(userId)
  await removeSubscriptionFromDB(userId)
  return { success: true }
}

export async function sendNotification(userId: string, message: string) {
  const subscription = subscriptions.get(userId)
  if (!subscription) {
    throw new Error('No subscription available')
  }

  const url = new URL(subscription.endpoint)
  if (url.protocol !== 'https:') {
    throw new Error('Invalid subscription endpoint')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

