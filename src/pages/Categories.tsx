import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, Folder, FolderOpen, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { categoriesService } from "@/services/categories";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";
import { categoryFormSchema, categorySchema, CategoryFormData, CategoryData } from "@/schemas/category";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: ""
    }
  });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesService.getCategories({ offset: 0, limit: 50 });
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: CategoryFormData) => {
    setSubmitting(true);
    
    try {
      // Transform form data using the schema
      const data: CategoryData = categorySchema.parse(formData);
      
      if (editingCategory) {
        // Update category
        const updateData: UpdateCategoryRequest = {
          name: data.name,
          slug: data.slug,
          ...(data.parentId !== null && { parentId: data.parentId })
        };
        await categoriesService.updateCategory(editingCategory.id, updateData);
      } else {
        // Create new category
        const createData: CreateCategoryRequest = {
          name: data.name,
          slug: data.slug,
          ...(data.parentId !== null && { parentId: data.parentId })
        };
        await categoriesService.createCategory(createData);
      }
      
      // Reload categories after successful operation
      await loadCategories();
      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        setLoading(true);
        await categoriesService.deleteCategory(categoryId);
        await loadCategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderCategoryRow = (category: Category, isChild = false) => (
    <TableRow key={category.id} className="hover:bg-muted/50">
      <TableCell>
        <div className={`flex items-center gap-2 ${isChild ? 'ml-6' : ''}`}>
          {isChild ? <FolderOpen className="w-4 h-4 text-muted-foreground" /> : <Folder className="w-4 h-4 text-primary" />}
          <span className="font-medium">{category.name}</span>
          {!isChild && <Badge variant="secondary">{category.children?.length || 0} subcategories</Badge>}
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm text-muted-foreground">{category.slug}</TableCell>
      <TableCell>
        <Badge variant="outline">0 products</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
    );
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">
            Organize your products with categories and subcategories
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter category name..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter category slug (e.g., movies, games)..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Select Parent Category --" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.filter(cat => !cat.parentId).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCategory(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-primary hover:opacity-90"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading categories...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {/* {categories.map((category) => (
                    <React.Fragment key={category.id}>
                      {renderCategoryRow(category)}
                      {category.children?.map((child) => renderCategoryRow(child, true))}
                    </React.Fragment>
                  ))} */}
                  {categories
                    .filter(category => !category.parentId) // Only show parent categories
                    .map((category) => (
                      <React.Fragment key={category.id}>
                        {renderCategoryRow(category)}
                        {category.children?.map((child) => renderCategoryRow(child, true))}
                      </React.Fragment>
                    ))}
                </TableBody>
              </Table>
              
              {categories.filter(category => !category.parentId).length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}