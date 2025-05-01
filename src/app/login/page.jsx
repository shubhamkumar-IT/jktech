"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEnvelope as Mail,
  FaGoogle as GoogleIcon,
  FaLock as LockIcon,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../../lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const { login, error, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("You have been logged in successfully");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast.success("You have been logged in successfully with Google");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Google login failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md bg-white">
        <div className="shadow-lg rounded-lg p-8">
          <h2 className="text-2xl text-[#5277df] font-bold text-center mb-4">
            Log In
          </h2>
          <p className="text-center text-sm mb-6">
            Enter your email and password to access your account
          </p>

          {error && (
            <motion.div
              className="bg-red-100 text-red-600 text-sm p-3 rounded-md flex items-center gap-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-[#5277df] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="********"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-4 bg-[#5277df] text-white rounded-md hover:bg-primary/90 transition duration-200"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-600">
                or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition duration-200"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <div className="flex justify-center items-center">
              <GoogleIcon className="h-4 w-4 mr-2" />
              Google
            </div>
          </button>

          <div className="text-center mt-4 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#5277df]  hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
