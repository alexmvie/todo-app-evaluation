export interface Task {
    id: string;
    title: string;
    completed: boolean;
    category: string;
    createdAt: string;
    dueDate?: string;
}
