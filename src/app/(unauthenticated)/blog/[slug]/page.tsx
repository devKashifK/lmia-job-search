import React from "react";
import { Metadata } from 'next';
import BlogLayout from "./blog-layout";
import PostContent from "./post-content";
import { getServerClient } from "../serverClient";
import { GET_POST_BY_SLUG } from "../queries";
import type { Post } from "../types";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getServerClient();
  
  try {
    const { data } = await client.query<{ post: Post | null }>({
      query: GET_POST_BY_SLUG,
      variables: { slug },
    });

    const post = data?.post;
    if (!post) return {};

    const title = post.seo?.title || post.title;
    const description = post.seo?.metaDesc || post.excerpt?.replace(/<[^>]*>?/gm, '');
    const canonical = post.seo?.canonical || `https://jobmaze.ca/blog/${slug}`;
    const ogImage = post.featuredImage?.node?.sourceUrl;

    console.log(`[SEO DEBUG] Generating metadata for ${slug}:`, { title, canonical });

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        type: 'article',
        url: canonical,
        images: ogImage ? [{ url: ogImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const client = getServerClient();
    
    let post: Post | null = null;
    try {
        const { data } = await client.query<{ post: Post | null }>({
            query: GET_POST_BY_SLUG,
            variables: { slug },
        });
        post = data?.post as Post | null;
    } catch (err) {
        console.error("Error fetching post:", err);
    }

    if (!post) {
        notFound();
    }

    return (
        <BlogLayout>
            <PostContent post={post} />
        </BlogLayout>
    );
}
