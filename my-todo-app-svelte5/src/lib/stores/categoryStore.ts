// Import the writable store from Svelte
// A writable store is like a special container that can hold data and notify components when the data changes
import { writable } from 'svelte/store';

// Import a function that helps us update tasks when categories change
import { updateTaskCategory } from './taskStore';

// Define what a Category looks like
// Think of this as a blueprint for our category objects
export interface Category {
    // Unique identifier for each category
    // Example: 'category-1'
    id: string;
    
    // The name of the category
    // Example: 'Work'
    name: string;
    
    // A color code that will be used to visually distinguish categories
    // Example: '#FF6B6B' (a shade of red)
    color: string;
    
    // The order in which categories should appear
    // Example: 0 for first, 1 for second, etc.
    index: number;
}

// Define our initial categories when the app starts
// These are the default categories that come with the app
const initialCategories: Category[] = [
    { id: 'category-1', name: 'Work', color: '#FF6B6B', index: 0 },
    { id: 'category-2', name: 'Personal', color: '#4ECDC4', index: 1 },
    { id: 'category-3', name: 'Shopping', color: '#45B7D3', index: 2 },
    { id: 'category-4', name: 'Health', color: '#A4D8A4', index: 3 }
];

// Create our main stores
// Think of these as special boxes that hold our data
// When we put something in these boxes, all parts of our app that are watching them will be notified
export const categories = writable<Category[]>(initialCategories);
// This store keeps track of which category is currently selected
export const selectedCategory = writable<string>('Work');

// Function to add a new category
// Returns an object with success status and any error message
export function addCategory(category: Category): { success: boolean; error?: string } {
    // Variables to track if the operation was successful and any error messages
    let error: string | undefined;
    let success = false;

    // Update the categories store
    // The update function takes a callback that gets the current value of the store
    categories.update(cats => {
        // Make the category name lowercase and remove any extra spaces
        // This helps us avoid duplicate categories with different capitalization
        const categoryName = category.name.trim().toLowerCase();
        
        // Check if a category with this name already exists
        // We use some() to check if any category matches our condition
        if (cats.some(cat => cat.name.toLowerCase() === categoryName)) {
            error = 'This category already exists';
            // If we find a duplicate, we return the current categories without changes
            return cats;
        }
        
        // If we got here, everything is good!
        success = true;
        
        // Generate a unique ID for the new category
        // We use the current timestamp to create a unique ID
        const newId = `category-${Date.now()}`;
        
        // Create a new array with our existing categories plus the new one
        // We use the spread operator (...) to copy all existing categories
        // Then we add our new category with the generated ID and lowercase name
        return [...cats, { ...category, id: newId, name: categoryName }];
    });

    // Return whether the operation was successful and any error message
    return { success, error };
}

// Function to update an existing category
// Returns an object with success status and any error message
export function updateCategory(categoryId: string, updatedCategory: Category): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        // Find the category we want to update
        const existingCategory = cats.find(cat => cat.id === categoryId);
        
        // If we can't find the category, return an error
        if (!existingCategory) {
            error = 'Category not found';
            return cats;
        }

        // Make sure the new name isn't already used by another category
        const trimmedName = updatedCategory.name.trim().toLowerCase();
        if (cats.some(cat => cat.name.toLowerCase() === trimmedName && cat.id !== categoryId)) {
            error = 'This category already exists';
            return cats;
        }
        
        success = true;
        
        // Create a new array with the updated category
        const updatedCategories = cats.map(cat => 
            // If this is the category we're updating, use the new name
            // Otherwise, keep the existing category as is
            cat.id === categoryId ? { ...cat, name: trimmedName } : cat
        );
        
        // Update all tasks that belong to this category
        updateTaskCategory(existingCategory.name, trimmedName);
        
        // If this was the selected category, update the selected category store
        selectedCategory.update(selected => 
            selected === existingCategory.name ? trimmedName : selected
        );

        return updatedCategories;
    });

    return { success, error };
}

// Function to delete a category
// Returns an object with success status and any error message
export function deleteCategory(categoryId: string): { success: boolean; error?: string } {
    let error: string | undefined;
    let success = false;

    categories.update(cats => {
        // Make sure we don't delete the last category
        if (cats.length <= 1) {
            error = 'You must have at least one category';
            return cats;
        }

        // Find the category we want to delete
        const categoryToDelete = cats.find(cat => cat.id === categoryId);
        
        // If we can't find the category, return an error
        if (!categoryToDelete) {
            error = 'Category not found';
            return cats;
        }

        success = true;
        
        // Create a new array without the category we're deleting
        const remainingCategories = cats.filter(cat => cat.id !== categoryId);
        
        // Move all tasks from the deleted category to the first remaining category
        updateTaskCategory(categoryToDelete.name, remainingCategories[0].name);
        
        // If this was the selected category, update the selected category store
        selectedCategory.update(selected => 
            selected === categoryToDelete.name ? remainingCategories[0].name : selected
        );

        return remainingCategories;
    });

    return { success, error };
}
