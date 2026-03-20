import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { DeadlineEvent } from '@/types';
import toast from 'react-hot-toast';

export const subscribeToEvents = (
  userId: string,
  callback: (events: DeadlineEvent[]) => void
) => {
  if (!db) return () => {};
  const q = query(
    collection(db, 'events'),
    where('userId', '==', userId),
    orderBy('deadline', 'asc')
  );

  return onSnapshot(q, (snap) => {
    const events = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DeadlineEvent[];
    callback(events);
  });
};

export const createEvent = async (
  userId: string,
  data: Omit<DeadlineEvent, 'id' | 'createdAt' | 'userId'>
) => {
  if (!db) {
    toast.error('Firebase database not initialized. Please check your config.');
    throw new Error('Database not initialized');
  }

  const payload: any = {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  };

  // Ensure deadline is stored as a Timestamp in Firestore
  if (data.deadline instanceof Timestamp) {
    payload.deadline = data.deadline;
  } else if (data.deadline) {
    payload.deadline = Timestamp.fromDate(new Date(data.deadline as string));
  }

  // Handle reminders
  if (data.reminders) {
    payload.reminders = (data.reminders as unknown as (string | Timestamp)[]).map((r) =>
      r instanceof Timestamp ? r : Timestamp.fromDate(new Date(r))
    );
  }

  const ref = await addDoc(collection(db, 'events'), payload);
  return ref.id;
};

export const updateEvent = async (
  eventId: string,
  data: Partial<DeadlineEvent>
) => {
  if (!db) {
    toast.error('Firebase database not initialized');
    throw new Error('Database not initialized');
  }

  const ref = doc(db, 'events', eventId);
  const payload: Record<string, unknown> = {};

  // Copy primitives
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.category !== undefined) payload.category = data.category;
  if (data.priority !== undefined) payload.priority = data.priority;
  if (data.status !== undefined) payload.status = data.status;

  // Handle deadline
  if (data.deadline !== undefined) {
    payload.deadline = data.deadline instanceof Timestamp
      ? data.deadline
      : Timestamp.fromDate(new Date(data.deadline as string));
  }

  // Handle reminders
  if (data.reminders !== undefined) {
    payload.reminders = (data.reminders as unknown as (string | Timestamp)[]).map((r) =>
      r instanceof Timestamp ? r : Timestamp.fromDate(new Date(r))
    );
  }

  await updateDoc(ref, payload);
};

export const deleteEvent = async (eventId: string) => {
  await deleteDoc(doc(db, 'events', eventId));
};
