export interface Category {
  id: string;
  name: string;
}

export interface MasterGoal {
  id: string;
  categoryId: string;
  title: string;
  points: number;
  description: string;
}

export interface AssignedGoal {
  goalId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  bio: string;
  photo: string;
  tags?: string[];
  assignedGoals: AssignedGoal[];
  totalPoints?: number;
  previousRank?: number;
  createdAt?: string;
}
