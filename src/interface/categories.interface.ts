import { TypeCategory } from "@/app/redux/categories/enum.categories";

export interface CategoryDto {
    name: string;
    slug?: string | "";
    description?: string;
    isActive?: boolean;
    type: string | TypeCategory.BOTH,
    movieCount?: number | 0;
    storyCount?: number | 0;
}

export interface Categories {
    _id: string,
    name: string,
    slug: string,
    description: string,
    isActive: boolean,
    movieCount: number,
    storyCount: number,
    type: string,
    createdAt: Date,
    updatedAt: Date,
}