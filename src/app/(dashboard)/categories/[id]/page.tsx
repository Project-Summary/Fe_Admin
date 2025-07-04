"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateCategoryThunk, deleteCategoryThunk } from "@/app/redux/categories/thunk.categories";
import { Categories, CategoryDto } from "@/interface/categories.interface";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.categories);

  const [category, setCategory] = useState<Categories | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch category data on mount
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const result = await dispatch(getCategoryByIdThunk(params.id)).unwrap();
        setCategory(result);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch category:", error);
        toast.error("Failed to load category");
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCategory();
    }
  }, [params.id, dispatch]);

  const handleSave = async () => {
    if (!category || !category._id) return;

    try {
      setIsSaving(true);
      await dispatch(updateCategoryThunk({
        id: category._id,
        data: category,
        onSuccess: () => {
          toast.success("Category updated successfully");
          router.push("/categories");
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to update category:", error);
      // Error được handle trong thunk
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category || !category._id) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteCategoryThunk({
        id: category._id,
        onSuccess: () => {
          toast.success("Category deleted successfully");
          router.push("/categories");
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to delete category:", error);
      // Error được handle trong thunk
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof CategoryDto, value: any) => {
    if (category) {
      setCategory({ ...category, [field]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Category not found</p>
          <Button onClick={() => router.push("/categories")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  const totalItems = (category.movieCount || 0) + (category.storyCount || 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/categories")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Category</h1>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the category
                  "{category.name}" and remove it from all associated content.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete Category
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button className="gap-2" onClick={handleSave} disabled={isSaving || !category.name.trim()}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Category Details</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Edit the category details and properties.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={category.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center h-10 space-x-4">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {category.type === "movie"
                        ? "Movies Only"
                        : category.type === "story"
                          ? "Stories Only"
                          : "Movies & Stories"}
                    </Badge>
                    <Badge variant="outline">{totalItems} Items</Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={category.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-20"
                  placeholder="Enter category description"
                />
              </div>

              <div className="grid gap-2">
                <Label>Category Type</Label>
                <RadioGroup
                  value={category.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="movie" id="movie" />
                    <Label htmlFor="movie">Movies Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="story" id="story" />
                    <Label htmlFor="story">Stories Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both Movies & Stories</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={category.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="active">Active Category</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Additional information about this category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Category ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{category._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Items</p>
                  <p className="text-sm text-muted-foreground">{totalItems} items</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created On</p>
                  <p className="text-sm text-muted-foreground">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Modified</p>
                  <p className="text-sm text-muted-foreground">
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  {category.movieCount || 0} movies, {category.storyCount || 0} stories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.movieCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {totalItems > 0 ? Math.round(((category.movieCount || 0) / totalItems) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.storyCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {totalItems > 0 ? Math.round(((category.storyCount || 0) / totalItems) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Usage</CardTitle>
              <CardDescription>
                How this category is being used across your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Movies</span>
                  <span>{category.movieCount || 0}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: totalItems > 0 ? `${((category.movieCount || 0) / totalItems) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stories</span>
                  <span>{category.storyCount || 0}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: totalItems > 0 ? `${((category.storyCount || 0) / totalItems) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}