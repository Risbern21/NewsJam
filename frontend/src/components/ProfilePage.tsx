import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Link2, FileText, Image, Music, Moon, Sun, LogOut, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { User } from '../App';
import { getApiEndpoint } from '../utils/api';

interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  url: string | null;
  likes: number;
  dislikes: number;
  created_at?: string;
  real?: boolean | null;
  credibility_score?: number | null;
}

export function ProfilePage({ user, onLogout, isDarkMode, onToggleDarkMode }: ProfilePageProps) {
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(getApiEndpoint("/api/v1/posts/user/me"), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPosts(data);
      } else {
        console.error("Failed to fetch user posts");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Link2 className="size-4" />;
      case 'text':
        return <FileText className="size-4" />;
      case 'image':
        return <Image className="size-4" />;
      case 'audio':
        return <Music className="size-4" />;
      default:
        return null;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'uncertain':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'false':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return '';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return 'Likely True';
      case 'uncertain':
        return 'Uncertain';
      case 'false':
        return 'Likely False';
      default:
        return verdict;
    }
  };

  // Calculate stats from user posts
  const totalVerifications = userPosts.length;
  // For now, we don't have verdict/credibility scores in the database
  // These can be added later if needed
  const trueCount = 0;
  const falseCount = 0;
  const uncertainCount = 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  const getPostType = (post: UserPost): 'url' | 'text' | 'image' => {
    if (post.url) {
      const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
      if (imagePattern.test(post.url)) {
        return 'image';
      }
      return 'url';
    }
    return 'text';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* User Profile Card */}
          <Card className="mb-6 border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="size-24">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-2xl">{user.username[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-gray-900 dark:text-white mb-1">{user.username}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggleDarkMode}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="size-4 mr-2" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="size-4 mr-2" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLogout}
                      className="text-red-600 dark:text-red-400"
                    >
                      <LogOut className="size-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-green-600 dark:text-green-500" />
                Verification Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {totalVerifications}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Total Posts
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                    {userPosts.filter(p => p.likes > 0).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    With Likes
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                    {userPosts.filter(p => p.url).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    URL Posts
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                    {userPosts.filter(p => !p.url).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Text Posts
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent verification history</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading your posts...
                </div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No posts yet. Start verifying content to see your activity here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPosts.map((post, index) => {
                    const postType = getPostType(post);
                    return (
                      <div key={post.id}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                            
                              <p className="text-gray-900 dark:text-white mb-1 font-medium">
                                {post.title}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                                {post.content || post.url || "No content"}
                              </p>
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Calendar className="size-4" />
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        {index < userPosts.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
