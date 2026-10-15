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

export interface FriendComparisonData {
  user1: {
    username: string;
    displayName: string;
    results: ResultItem[];
    avgPercentage: number;
    highestScore: number;
    totalPassed: number;
  };
  user2: {
    username: string;
    displayName: string;
    results: ResultItem[];
    avgPercentage: number;
    highestScore: number;
    totalPassed: number;
  };
}
