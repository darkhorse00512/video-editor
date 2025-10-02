"use client";

import { AuthLayout } from "@/components/Auth/AuthLayout";
import { NextSignInForm } from "@/components/Auth/NextSignInForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated && user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const handleLoginSuccess = () => {
    router.push("/");
  };

  // Show loading if checking authentication
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
    >
      <NextSignInForm onSuccess={handleLoginSuccess} />
    </AuthLayout>
  );
}
