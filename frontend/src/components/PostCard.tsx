import React, { useState } from "react";

import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { CommentCard } from "./CommentCard";
import type { Post, User, Comment } from "../App";

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onUpdatePost: (post: Post) => void;
}

export function PostCard({ post, currentUser, onUpdatePost }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);
  const [comments, setComments] = useState(post.comments);

  const handleAddComment = () => {
    if (commentText.trim() && currentUser) {
      const newComment: Comment = {
        id: Date.now().toString(),
        username: currentUser.username,
        avatar: currentUser.avatar,
        text: commentText,
        timestamp: "Just now",
      };
      setComments([...comments, newComment]);
      setCommentText("");
    }
  };

  const getVerdictBadge = () => {
    if (!post.verification_verdict) return null;

    const verdict = post.verification_verdict.toLowerCase();
    
    if (verdict === "real") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
          <CheckCircle2 className="size-3" />
          Real
        </Badge>
      );
    } else if (verdict === "fake") {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
          <XCircle className="size-3" />
          Fake
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1">
          <AlertCircle className="size-3" />
          Uncertain
        </Badge>
      );
    }
  };

  const getCredibilityScore = () => {
    if (post.credibility_score === null || post.credibility_score === undefined) {
      return null;
    }

    const score = post.credibility_score;
    let colorClass = "text-gray-600 dark:text-gray-400";
    
    if (score >= 70) {
      colorClass = "text-green-600 dark:text-green-400";
    } else if (score >= 40) {
      colorClass = "text-amber-600 dark:text-amber-400";
    } else {
      colorClass = "text-red-600 dark:text-red-400";
    }

    return (
      <Badge variant="outline" className={`${colorClass} border-current`}>
        Credibility: {score}/100
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="min-w-0 flex items-center gap-3">
              <User  />
              <p className="text-gray-900 dark:text-white font-medium">{post.username}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="text-gray-900 dark:text-white mb-2 font-semibold">{post.title}</h3>

          {/* Verification Results */}
          {(post.verification_verdict || post.credibility_score !== null) && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {getVerdictBadge()}
              {getCredibilityScore()}
            </div>
          )}

          {/* Verification Explanation */}
          {post.verification_explanation && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>AI Analysis:</strong> {post.verification_explanation}
              </p>
            </div>
          )}

          {post.type === "url" && (
            <a
              href={post.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              <ExternalLink className="size-4 shrink-0" />
              <span className="truncate">{post.content}</span>
            </a>
          )}

          {post.type === "text" && (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">
              {post.content}
            </p>
          )}

          {post.type === "image" && post.imageUrl && (
            <div className="space-y-3">
              {/* Display the image */}
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    // Fallback if image fails to load
                    console.error("Failed to load image:", post.imageUrl);
                  }}
                />
              </div>
              {/* Display extracted text content if available */}
              {post.content && post.content.trim() && (
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Extracted Text:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                    {post.content}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLikes(likes + 1);
              onUpdatePost({ ...post, likes: likes + 1 });
            }}
          >
            <ThumbsUp className="size-4 mr-1" />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDislikes(dislikes + 1);
              onUpdatePost({ ...post, dislikes: dislikes + 1 });
            }}
          >
            <ThumbsDown className="size-4 mr-1" />
            {dislikes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="size-4 mr-1" />
            {comments.length}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}

            {currentUser && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Comment
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


