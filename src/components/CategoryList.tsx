'use client'

import { useTaskStore } from "@/store/useTaskStore"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function CategoryList() {
    const categories = useTaskStore(state => state.categories)
    const tasks = useTaskStore(state => state.tasks)
    const selectedCategory = useTaskStore(state => state.selectedCategory)
    const setSelectedCategory = useTaskStore(state => state.setSelectedCategory)

    const getTaskStats = (category: string) => {
        const categoryTasks = tasks.filter(task => task.category === category)
        const openTasks = categoryTasks.filter(task => !task.completed)
        return {
            total: categoryTasks.length,
            open: openTasks.length
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {categories.map((category) => {
                        const stats = getTaskStats(category)
                        return (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "ghost"}
                                className="w-full justify-between"
                                onClick={() => setSelectedCategory(category)}
                            >
                                <span>{category}</span>
                                <span className={`ml-2 ${selectedCategory === category ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                    {stats.open}/{stats.total}
                                </span>
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
