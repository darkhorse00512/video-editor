"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setUser, clearUser } from "@/store/slices/userSlice";
import config from "@/config/config";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check for tokens in sessionStorage
        const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem("access_token") : null;
        const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem("refresh_token") : null;

        if (!accessToken || !refreshToken) {
          dispatch(clearUser());
          router.push("/login");
          return;
        }

        // Try to get user data from localStorage
        try {
          const storedUserData = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
          
          if (storedUserData) {
            const user = JSON.parse(storedUserData);
            dispatch(setUser(user));
          } else {
            // No stored user data - redirect to login
            dispatch(clearUser());
            router.push("/login");
            return;
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          // Clear invalid data and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_data');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
          }
          dispatch(clearUser());
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        dispatch(clearUser());
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (user will be redirected)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}
