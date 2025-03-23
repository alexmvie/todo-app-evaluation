import { writable } from 'svelte/store';
import { updateTasksCategory } from './taskStore';

export const categories = writable<string[]>(['personal', 'work', 'shopping', 'health']);
export const selectedCategory = writable<string>('personal');

export function addCategory(newCategory: string): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        const categoryValue = newCategory.trim().toLowerCase();
        if (cats.includes(categoryValue)) {
            error = 'This category already exists';
            return cats;
        }
        success = true;
        return [...cats, categoryValue];
    });

    return { success, error };
}

export function updateCategory(oldValue: string, newValue: string): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        const trimmedValue = newValue.trim().toLowerCase();
        if (cats.includes(trimmedValue) && trimmedValue !== oldValue) {
            error = 'This category already exists';
            return cats;
        }
        success = true;
        const updatedCategories = cats.map(cat => 
            cat === oldValue ? trimmedValue : cat
        );
        
        // Update tasks with the new category name
        updateTasksCategory(oldValue, trimmedValue);
        
        // Update selected category if needed
        selectedCategory.update(selected => 
            selected === oldValue ? trimmedValue : selected
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
        const remainingCategories = cats.filter(cat => cat !== categoryToDelete);
        
        // Move tasks to the first category
        updateTasksCategory(categoryToDelete, remainingCategories[0]);
        
        // Update selected category if needed
        selectedCategory.update(selected => 
            selected === categoryToDelete ? remainingCategories[0] : selected
        );

        return remainingCategories;
    });

    return { success, error };
}
