import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { TopNav } from './components/TopNav';
import { CommunityPage } from './components/CommunityPage';
import { UploadPage } from './components/UploadPage';
import { ProfilePage } from './components/ProfilePage';
import { LoginPage } from './components/LoginPage';
import { getApiEndpoint } from './utils/api';

type Page = 'community' | 'upload' | 'profile' | 'login';

export interface Post {
  id: string;
  user_id: string;
  username: string;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  type?: "url" | "text" | "image";
  real?: boolean | null;
  credibility_score?: number | null;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface VerificationHistory {
  id: string;
  type: 'url' | 'text' | 'image' | 'audio';
  content: string;
  credibilityScore: number;
  verdict: 'true' | 'uncertain' | 'false';
  verifiedDate: string;
}

// Mock community posts
const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    username: 'Sarah Chen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    type: 'url',
    title: 'Breaking: New Climate Study Results',
    content: 'https://example.com/climate-study-2025',
    credibilityScore: 87,
    verdict: 'true',
    likes: 234,
    dislikes: 12,
    comments: [
      {
        id: '1',
        username: 'Mike Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        text: 'Great find! This study is peer-reviewed.',
        timestamp: '2 hours ago'
      }
    ],
    createdAt: '2 hours ago'
  },
  {
    id: '2',
    userId: '2',
    username: 'Alex Kumar',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    type: 'image',
    title: 'Viral Image: Is This Photo Real?',
    content: 'viral-protest-image.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
    credibilityScore: 34,
    verdict: 'false',
    likes: 156,
    dislikes: 289,
    comments: [
      {
        id: '1',
        username: 'Emma Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        text: 'Reverse image search shows this is from 2018.',
        timestamp: '1 hour ago'
      },
      {
        id: '2',
        username: 'David Lee',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        text: 'Thanks for verifying this!',
        timestamp: '3 hours ago'
      }
    ],
    createdAt: '5 hours ago'
  },
  {
    id: '3',
    userId: '3',
    username: 'Maria Garcia',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    type: 'text',
    title: 'Health Claim Verification',
    content: 'New research suggests that drinking 8 glasses of water daily can significantly improve cognitive function and reduce fatigue by up to 40%.',
    credibilityScore: 58,
    verdict: 'uncertain',
    likes: 78,
    dislikes: 45,
    comments: [],
    createdAt: '1 day ago'
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleLogin = async (username:string,email:string,password:string, setLoginError?: (error: string | null) => void) => {
    if (!username || !password ||!email) {
      if (setLoginError) {
        setLoginError("Please fill in all fields.");
      }
      return;
    }

    // Clear any previous errors
    if (setLoginError) {
      setLoginError(null);
    }

    try {
      // STEP 1: Get JWT access token
      // Note: OAuth2PasswordRequestForm uses "username" field, but we send email since backend authenticates by email
      const tokenResponse = await fetch(
        getApiEndpoint("/api/v1/auth/token"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email, // Backend authenticates by email, not username
            password,
          }),
        }
      );

      if (!tokenResponse.ok) {
        let errorMessage = "You have entered an incorrect username or password.";
        
        // Try to get the error message from the response
        try {
          const contentType = tokenResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await tokenResponse.json();
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } else {
            const errorText = await tokenResponse.text();
            if (errorText) {
              try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorMessage;
              } catch {
                // If not JSON, use the text as is if it's meaningful
                if (errorText.includes("incorrect") || errorText.includes("password") || errorText.includes("username")) {
                  errorMessage = errorText;
                }
              }
            }
          }
        } catch (err) {
          // Use default error message if parsing fails
          console.error("Error parsing login error:", err);
        }
        
        console.error("Login failed:", errorMessage);
        if (setLoginError) {
          setLoginError(errorMessage);
        }
        return;
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // STEP 2: Fetch user info using JWT dynamically
      const userResponse = await fetch(
        getApiEndpoint("/api/v1/users/login"),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!userResponse.ok) {
        const err = await userResponse.text();
        console.error("Fetching user info failed:", err);
        return;
      }

      const userData = await userResponse.json();

      // STEP 3: Store token for later use (optional)
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setCurrentUser(userData)
      setCurrentPage("community")
      
      // Clear any error messages on successful login
      if (setLoginError) {
        setLoginError(null);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      if (setLoginError) {
        setLoginError("An error occurred during login. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const handleUpload = async (type: 'url' | 'text' | 'image' , content: string, title: string, imageUrl?: string) => {
    if (!currentUser) {
      console.error("User not logged in");
      alert("Please log in to upload posts.");
      return;
    }

    // Image posts are already created by the upload_image_post endpoint
    // Just navigate to community page
    if (type === 'image' && !content) {
      setCurrentPage('community');
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      // Prepare post data
      const postData = {
        user_id: currentUser.id,
        title: title,
        content: content,
        url: type === 'url' ? content : (type === 'image' ? imageUrl : null),
        likes: 0,
        dislikes: 0,
      };

      // Create the post via API
      const postResponse = await fetch(getApiEndpoint("/api/v1/posts"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error("Failed to create post:", errorText);
        alert("Failed to create post. Please try again.");
        return;
      }

      const createdPost = await postResponse.json();

      // console.log(createdPost);

      // Navigate to community page - it will fetch all posts including the new one
      setCurrentPage('community');
    } catch (error) {
      console.error("Error during upload:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  if (!currentUser) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20 md:pb-0">
        {/* Top Navigation - Desktop */}
        <div className="hidden md:block">
          <TopNav
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            user={currentUser}
            onLogout={handleLogout}
          />
        </div>
        
        <main className="md:pt-0">
          {currentPage === 'community' && (
            <CommunityPage 
              posts={posts} 
              currentUser={currentUser}
              onUpdatePost={handleUpdatePost}
            />
          )}
          {currentPage === 'upload' && (
            <UploadPage 
              onUpload={handleUpload}
            />
          )}
          {currentPage === 'profile' && (
            <ProfilePage 
              user={currentUser}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          )}
        </main>
        
        {/* Bottom Navigation - Mobile */}
        <div className="md:hidden">
          <BottomNav
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;