export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    count: number | null;
}

export interface FeaturedImage {
    node: {
        sourceUrl: string;
        altText: string | null;
    };
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    date: string;
    modified: string;
    featuredImage?: {
        node: {
            sourceUrl: string;
            altText: string;
        };
    };
    seo?: {
        title?: string;
        metaDesc?: string;
        canonical?: string;
    };
    categories?: {
        nodes: {
            name: string;
            slug: string;
        }[];
    };
}

export interface CategoriesData {
    categories: {
        nodes: Category[];
    };
}

export interface PostsData {
    posts: {
        nodes: Post[];
    };
}

export interface PostData {
    post: Post;
} 