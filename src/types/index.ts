export type ResultCategory = 
  | 'Academic Exam' 
  | 'Quiz & Test' 
  | 'Course & Cert' 
  | 'Coding' 
  | 'Fitness & Sports' 
  | 'Gaming' 
  | 'Project'
  | 'Other';

export interface UserProfile {
  uid: string;
  username: string; // e.g. "alex_dev" (lowercase, unique handle)
  displayName: string;
  avatar: string;
  bio?: string;
  email?: string;
  joinedAt: string;
}

export interface ResultItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  title: string;
  category: ResultCategory;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: string;
  notes?: string;
  proofUrl?: string;
  tags?: string;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  resultId: string;
  userId: string;
  username: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export interface FriendItem {
  friendUid: string;
  username: string;
  displayName: string;
  avatar: string;
  addedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderUid: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
}

export interface ReelItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  videoUrl: string;
  caption: string;
  tags?: string;
  audioTrack?: string;
  likes: number;
  commentsCount?: number;
  createdAt: string;
}

export interface ReelComment {
  id: string;
  reelId: string;
  userId: string;
  username: string;
  displayName: string;
  text: string;
  createdAt: string;
}
