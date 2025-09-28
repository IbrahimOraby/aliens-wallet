import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Folder, FolderOpen, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { categoriesService } from "@/services/categories";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", parentId: "" });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingCategory) {
        // Update category
        const updateData: UpdateCategoryRequest = {
          name: formData.name,
          parentId: formData.parentId ? parseInt(formData.parentId) : null
        };
        await categoriesService.updateCategory(editingCategory.id, updateData);
      } else {
        // Create new category
        const createData: CreateCategoryRequest = {
          name: formData.name,
          parentId: formData.parentId ? parseInt(formData.parentId) : null
        };
        await categoriesService.createCategory(createData);
      }
      
      // Reload categories after successful operation
      await loadCategories();
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", parentId: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="parent">Parent Category (Optional)</Label>
                <select
                  id="parent"
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Parent Category --</option>
                  {categories.filter(cat => !cat.parentId).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: "", parentId: "" });
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