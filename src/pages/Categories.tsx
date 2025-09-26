import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Folder, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Gift Cards",
      slug: "gift-cards",
      productCount: 25,
      children: [
        { id: "1-1", name: "Entertainment", slug: "entertainment", parentId: "1", productCount: 12 },
        { id: "1-2", name: "Shopping", slug: "shopping", parentId: "1", productCount: 8 },
        { id: "1-3", name: "Gaming", slug: "gaming", parentId: "1", productCount: 5 }
      ]
    },
    {
      id: "2", 
      name: "Digital Services",
      slug: "digital-services",
      productCount: 18,
      children: [
        { id: "2-1", name: "Streaming", slug: "streaming", parentId: "2", productCount: 10 },
        { id: "2-2", name: "Software", slug: "software", parentId: "2", productCount: 5 },
        { id: "2-3", name: "Cloud Storage", slug: "cloud-storage", parentId: "2", productCount: 3 }
      ]
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", parentId: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      // Update category logic
      console.log("Updating category:", editingCategory.id, formData);
    } else {
      // Create new category logic
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        parentId: formData.parentId || undefined,
        productCount: 0
      };
      console.log("Creating category:", newCategory);
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", parentId: "" });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, parentId: category.parentId || "" });
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      console.log("Deleting category:", categoryId);
      // Delete logic here
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
        <Badge variant="outline">{category.productCount} products</Badge>
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
                  {categories.map((cat) => (
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
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
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
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  {renderCategoryRow(category)}
                  {category.children?.map((child) => renderCategoryRow(child, true))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          
          {categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}