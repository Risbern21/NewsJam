import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PostCard } from "./PostCard";
import type { Post, User } from "../App";

interface CommunityPageProps {
  posts: Post[];
  currentUser: User | null;
  onUpdatePost: (post: Post) => void;
}

export function CommunityPage({
  posts,
  currentUser,
  onUpdatePost,
}: CommunityPageProps) {
  const [fetchedPosts, setFetchedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/api/v1/posts`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();

      // Transform backend posts to match frontend Post interface
      const transformedPosts: Post[] = data.map((post: any) => {
        // Convert UUIDs to strings
        const postId = typeof post.id === 'string' ? post.id : post.id.toString();
        const userId = typeof post.user_id === 'string' ? post.user_id : post.user_id.toString();
        
        // Determine post type based on content
        let postType: "url" | "text" | "image" = "text";
        let imageUrl: string | undefined = undefined;
        let contentValue: string = post.content || "";
        
        if (post.url) {
          // Check if URL is an image
          const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
          if (imagePattern.test(post.url)) {
            postType = "image";
            imageUrl = post.url;
            contentValue = post.content || post.title || ""; // Use content or title for image posts
          } else {
            postType = "url";
            contentValue = post.url; // For URL type, content should be the URL
          }
        } else if (post.content) {
          postType = "text";
          contentValue = post.content;
        }
        
        return {
          id: postId,
          user_id: userId,
          username: post.user?.username || "Unknown User",
          title: post.title,
          content: contentValue,
          imageUrl: imageUrl,
          likes: post.likes || 0,
          dislikes: post.dislikes || 0,
          comments: [], // Comments not yet implemented in backend
          type: postType,
          real: post.real !== undefined ? post.real : null,
          credibility_score: post.credibility_score !== undefined ? post.credibility_score : null,
        };
      });
      
      setFetchedPosts(transformedPosts);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Community Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See what others are verifying
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">
            Loading posts...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 dark:text-red-400 py-6">
            {error}
          </div>
        )}

        {/* Posts */}
        {!loading && !error && (
          <div className="space-y-4">
            {fetchedPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  onUpdatePost={onUpdatePost}
                />
              </motion.div>
            ))}

            {fetchedPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No posts yet. Be the first to verify something!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
