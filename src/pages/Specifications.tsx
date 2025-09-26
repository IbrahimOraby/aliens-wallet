import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Settings2, X } from "lucide-react";

interface SpecificationOption {
  id: string;
  label: string;
  value: string;
}

interface Specification {
  id: string;
  name: string;
  type: "select" | "multiselect" | "text" | "boolean";
  required: boolean;
  allowFiltering: boolean;
  options?: SpecificationOption[];
  products: string[];
}

export default function Specifications() {
  const [specifications, setSpecifications] = useState<Specification[]>([
    {
      id: "1",
      name: "Plan Type",
      type: "select",
      required: true,
      allowFiltering: true,
      options: [
        { id: "1-1", label: "Basic", value: "basic" },
        { id: "1-2", label: "Pro", value: "pro" },
        { id: "1-3", label: "Enterprise", value: "enterprise" }
      ],
      products: ["Spotify", "ChatGPT", "Netflix"]
    },
    {
      id: "2",
      name: "Duration",
      type: "select",
      required: true,
      allowFiltering: true,
      options: [
        { id: "2-1", label: "1 Month", value: "1-month" },
        { id: "2-2", label: "3 Months", value: "3-months" },
        { id: "2-3", label: "6 Months", value: "6-months" },
        { id: "2-4", label: "12 Months", value: "12-months" }
      ],
      products: ["Spotify", "Netflix", "Disney+"]
    },
    {
      id: "3",
      name: "Account Type",
      type: "select",
      required: false,
      allowFiltering: true,
      options: [
        { id: "3-1", label: "Family", value: "family" },
        { id: "3-2", label: "Individual", value: "individual" },
        { id: "3-3", label: "Student", value: "student" }
      ],
      products: ["Spotify", "Apple Music"]
    },
    {
      id: "4",
      name: "Region",
      type: "select",
      required: true,
      allowFiltering: false,
      options: [
        { id: "4-1", label: "Global", value: "global" },
        { id: "4-2", label: "US", value: "us" },
        { id: "4-3", label: "EU", value: "eu" },
        { id: "4-4", label: "Asia", value: "asia" }
      ],
      products: ["Steam", "PlayStation", "Xbox"]
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specification | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "select" as "select" | "multiselect" | "text" | "boolean",
    required: false,
    allowFiltering: false,
    options: [{ label: "", value: "" }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const specData: Specification = {
      id: editingSpec?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      required: formData.required,
      allowFiltering: formData.allowFiltering,
      options: formData.options.filter(opt => opt.label && opt.value).map((opt, index) => ({
        id: `${Date.now()}-${index}`,
        label: opt.label,
        value: opt.value
      })),
      products: editingSpec?.products || []
    };

    if (editingSpec) {
      setSpecifications(specs => specs.map(spec => 
        spec.id === editingSpec.id ? specData : spec
      ));
    } else {
      setSpecifications(specs => [...specs, specData]);
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSpec(null);
    setFormData({
      name: "",
      type: "select" as "select" | "multiselect" | "text" | "boolean",
      required: false,
      allowFiltering: false,
      options: [{ label: "", value: "" }]
    });
  };

  const handleEdit = (spec: Specification) => {
    setEditingSpec(spec);
    setFormData({
      name: spec.name,
      type: spec.type,
      required: spec.required,
      allowFiltering: spec.allowFiltering,
      options: spec.options?.map(opt => ({ label: opt.label, value: opt.value })) || [{ label: "", value: "" }]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (specId: string) => {
    if (confirm("Are you sure you want to delete this specification? This action cannot be undone.")) {
      setSpecifications(specs => specs.filter(spec => spec.id !== specId));
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: "", value: "" }]
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, field: "label" | "value", value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Specifications</h1>
          <p className="text-muted-foreground">
            Define dynamic product options like plans, duration, and account types
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Specification
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSpec ? "Edit Specification" : "Create New Specification"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spec-name">Specification Name</Label>
                  <Input
                    id="spec-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Plan Type, Duration..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="spec-type">Type</Label>
                  <select
                    id="spec-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="select">Select (Single Choice)</option>
                    <option value="multiselect">Multi-Select</option>
                    <option value="text">Text Input</option>
                    <option value="boolean">Yes/No Switch</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                  />
                  <Label htmlFor="required">Required Field</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="filtering"
                    checked={formData.allowFiltering}
                    onCheckedChange={(checked) => setFormData({ ...formData, allowFiltering: checked })}
                  />
                  <Label htmlFor="filtering">Allow Filtering</Label>
                </div>
              </div>

              {(formData.type === "select" || formData.type === "multiselect") && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <Input
                          placeholder="Label (e.g., Basic)"
                          value={option.label}
                          onChange={(e) => updateOption(index, "label", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value (e.g., basic)"
                          value={option.value}
                          onChange={(e) => updateOption(index, "value", e.target.value)}
                          className="flex-1"
                        />
                        {formData.options.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  {editingSpec ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Specifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Used In Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specifications.map((spec) => (
                <TableRow key={spec.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{spec.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{spec.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {spec.options ? (
                      <div className="flex flex-wrap gap-1">
                        {spec.options.slice(0, 3).map((option) => (
                          <Badge key={option.id} variant="secondary" className="text-xs">
                            {option.label}
                          </Badge>
                        ))}
                        {spec.options.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{spec.options.length - 3} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No options</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {spec.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      {spec.allowFiltering && <Badge variant="secondary" className="text-xs">Filterable</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {spec.products.slice(0, 2).map((product) => (
                        <Badge key={product} variant="outline" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                      {spec.products.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{spec.products.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(spec)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(spec.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {specifications.length === 0 && (
            <div className="text-center py-8">
              <Settings2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No specifications found. Create your first specification to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}