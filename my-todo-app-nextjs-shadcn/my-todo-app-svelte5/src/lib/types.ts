export interface Task {
    id: number;
    text: string;
    done: boolean;
    category: string;
    createdAt: string;
    dueDate?: string;
}
