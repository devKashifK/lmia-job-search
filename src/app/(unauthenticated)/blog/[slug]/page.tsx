"use client";

import React, { useState, useEffect } from "react";
import BlogLayout from "./blog-layout";
import PostContent from "./post-content";
import { getServerClient } from "../serverClient";
import { GET_POST_BY_SLUG } from "../queries";
import type { Post } from "../types";
import { notFound, useParams } from "next/navigation";

export default function BlogPostPage() {
    const params = useParams();
    const slug = typeof params?.slug === 'string' ? params.slug : '';
    
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!slug) return;
        
        async function fetchPost() {
            setLoading(true);
            try {
                const client = getServerClient();
                const { data } = await client.query<{ post: Post | null }>({
                    query: GET_POST_BY_SLUG,
                    variables: { slug },
                });
                
                if (data?.post) {
                    setPost(data.post);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error fetching post:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <BlogLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
                    <div className="text-slate-400 font-medium animate-pulse">Loading post...</div>
                </div>
            </BlogLayout>
        );
    }

    if (error || !post) {
        return (
            <BlogLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Post not found</h2>
                    <p className="text-slate-500 mb-6">The article you're looking for might have been moved or deleted.</p>
                </div>
            </BlogLayout>
        );
    }

    return (
        <BlogLayout>
            <PostContent post={post} />
        </BlogLayout>
    );
}
