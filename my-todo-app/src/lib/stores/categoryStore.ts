import { writable } from 'svelte/store';
import { updateTaskCategory } from './taskStore';

export interface Category {
    id: string;
    name: string;
    color: string;
    index: number;
}

const initialCategories: Category[] = [
    { id: 'category-1', name: 'Work', color: '#FF6B6B', index: 0 },
    { id: 'category-2', name: 'Personal', color: '#4ECDC4', index: 1 },
    { id: 'category-3', name: 'Shopping', color: '#45B7D3', index: 2 },
    { id: 'category-4', name: 'Health', color: '#A4D8A4', index: 3 }
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
        // Generate a unique ID for the new category
        const newId = `category-${Date.now()}`;
        return [...cats, { ...category, id: newId, name: categoryName }];
    });

    return { success, error };
}

export function updateCategory(categoryId: string, updatedCategory: Category): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        const existingCategory = cats.find(cat => cat.id === categoryId);
        if (!existingCategory) {
            error = 'Category not found';
            return cats;
        }

        const trimmedName = updatedCategory.name.trim().toLowerCase();
        if (cats.some(cat => cat.name.toLowerCase() === trimmedName && cat.id !== categoryId)) {
            error = 'This category already exists';
            return cats;
        }
        
        success = true;
        const updatedCategories = cats.map(cat => 
            cat.id === categoryId ? { ...cat, name: trimmedName } : cat
        );
        
        // Update tasks with the new category name
        updateTaskCategory(existingCategory.name, trimmedName);
        
        // Update selected category if needed
        selectedCategory.update(selected => 
            selected === existingCategory.name ? trimmedName : selected
        );

        return updatedCategories;
    });

    return { success, error };
}

export function deleteCategory(categoryId: string): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        if (cats.length <= 1) {
            error = 'You must have at least one category';
            return cats;
        }

        const categoryToDelete = cats.find(cat => cat.id === categoryId);
        if (!categoryToDelete) {
            error = 'Category not found';
            return cats;
        }

        success = true;
        const remainingCategories = cats.filter(cat => cat.id !== categoryId);
        
        // Move tasks to the first category
        updateTaskCategory(categoryToDelete.name, remainingCategories[0].name);
        
        // Update selected category if needed
        selectedCategory.update(selected => 
            selected === categoryToDelete.name ? remainingCategories[0].name : selected
        );

        return remainingCategories;
    });

    return { success, error };
}
