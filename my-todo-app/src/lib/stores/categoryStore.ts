import { writable } from 'svelte/store';
import { updateTaskCategory } from './taskStore';

export interface Category {
    name: string;
    color: string;
    index: number;
}

const initialCategories: Category[] = [
    { name: 'Work', color: '#FF6B6B', index: 0 },
    { name: 'Personal', color: '#4ECDC4', index: 1 },
    { name: 'Shopping', color: '#45B7D3', index: 2 },
    { name: 'Health', color: '#A4D8A4', index: 3 }
];

export const categories = writable<Category[]>(initialCategories);
export const selectedCategory = writable<string>('Work');

export function addCategory(category: Category): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        const categoryName = category.name.trim().toLowerCase();
        if (cats.some(cat => cat.name.toLowerCase() === categoryName)) {
            error = 'This category already exists';
            return cats;
        }
        success = true;
        return [...cats, { ...category, name: categoryName }];
    });

    return { success, error };
}

export function updateCategory(oldName: string, newName: string): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        const trimmedName = newName.trim().toLowerCase();
        if (cats.some(cat => cat.name.toLowerCase() === trimmedName && cat.name !== oldName)) {
            error = 'This category already exists';
            return cats;
        }
        success = true;
        const updatedCategories = cats.map(cat => 
            cat.name === oldName ? { ...cat, name: trimmedName } : cat
        );
        
        // Update tasks with the new category name
        updateTaskCategory(oldName, trimmedName);
        
        // Update selected category if needed
        selectedCategory.update(selected => 
            selected === oldName ? trimmedName : selected
        );

        return updatedCategories;
    });

    return { success, error };
}

export function deleteCategory(categoryToDelete: string): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        if (cats.length <= 1) {
            error = 'You must have at least one category';
            return cats;
        }

        success = true;
        const remainingCategories = cats.filter(cat => cat.name !== categoryToDelete);
        
        // Move tasks to the first category
        updateTaskCategory(categoryToDelete, remainingCategories[0].name);
        
        // Update selected category if needed
        selectedCategory.update(selected => 
            selected === categoryToDelete ? remainingCategories[0].name : selected
        );

        return remainingCategories;
    });

    return { success, error };
}
