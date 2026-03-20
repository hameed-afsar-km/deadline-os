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
  const ref = await addDoc(collection(db, 'events'), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    deadline: Timestamp.fromDate(new Date(data.deadline as unknown as string)),
    reminders: (data.reminders as unknown as string[]).map((r) =>
      Timestamp.fromDate(new Date(r))
    ),
  });
  return ref.id;
};

export const updateEvent = async (
  eventId: string,
  data: Partial<DeadlineEvent>
) => {
  const ref = doc(db, 'events', eventId);
  const payload: Record<string, unknown> = { ...data };
  if (data.deadline) {
    payload.deadline = Timestamp.fromDate(new Date(data.deadline as unknown as string));
  }
  if (data.reminders) {
    payload.reminders = (data.reminders as unknown as string[]).map((r) =>
      Timestamp.fromDate(new Date(r))
    );
  }
  await updateDoc(ref, payload);
};

export const deleteEvent = async (eventId: string) => {
  await deleteDoc(doc(db, 'events', eventId));
};
