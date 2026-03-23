import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Notification {
  title: string;
  date: string;
  source: 'Central' | 'State';
  stateName?: string;
  summary: string;
  url: string;
  category?: string;
  createdAt?: any;
}

export const saveNotification = async (notification: Notification) => {
  try {
    // Check if notification already exists by URL to avoid duplicates
    const q = query(collection(db, 'notifications'), where('url', '==', notification.url));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });
      return { success: true, message: 'Notification saved successfully' };
    } else {
      return { success: true, message: 'Notification already exists' };
    }
  } catch (error) {
    console.error('Error saving notification:', error);
    return { success: false, error: String(error) };
  }
};

export const getLatestNotifications = async (count: number = 5) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      orderBy('date', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notification);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};
