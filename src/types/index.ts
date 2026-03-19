import { Timestamp } from 'firebase/firestore';

export type Category = 'Study' | 'Hackathon' | 'Submission' | 'Personal' | 'Exam';
export type Priority = 'low' | 'medium' | 'high' | 'auto';
export type Status = 'pending' | 'completed';

export interface DeadlineEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: Category;
  deadline: Timestamp | string;
  reminders: (Timestamp | string)[];
  priority: Priority;
  status: Status;
  createdAt: Timestamp | null;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  createdAt: Timestamp | null;
}
