import { useState } from "react";
import { motion } from "motion/react";
import { Shield, Mail, User, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { getApiEndpoint } from "../utils/api";

interface LoginPageProps {
  onLogin: (username: string, email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && email.trim() && password.trim()) {
      isSignUp?onLogin(username,email,password):handleSignUp()
    }
  };

  const handleSignUp = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      username: username,
      email: email,
      hashed_password: password,
    });

    fetch(getApiEndpoint("/api/v1/users"), {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    })
      .then((response) => response.text())
      .catch((error) => console.error(error));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div>
              <h1 className="text-4xl mb-2 text-gray-900 dark:text-white">
                NewsJam
              </h1>
              <CardTitle>
                {isSignUp ? "Welcome Back":"Create an Account"}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? "Sign up to start verifying news"
                  : "Sign in to verify news and track your history"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-900 dark:text-white">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-900 dark:text-white">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-900 dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                disabled={!username.trim() || !email.trim() || !password.trim()}
              >
                {isSignUp ? "Sign In":"Sign Up"}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-green-600 dark:text-green-500 hover:underline"
              >
                {isSignUp
                  ? "Don't have an account? Sign Up":"Already have an account? Sign In"
                  }
              </button>
            </div>

            <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
