export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'work' | 'personal';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: TaskCategory;
  ownerId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTask {
  title: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
}

export interface UpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
}
