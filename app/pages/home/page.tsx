"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to food-search-section as default page
    router.push("/pages/home/food-search-section");
  }, [router]);

  // Loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 space-y-4 text-blue-600 animate-pulse bg-orange-50">
      <svg
        className="w-12 h-12 text-blue-500 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      <p className="text-lg font-medium">Đang tải trang chủ...</p>
      <p className="text-sm text-gray-500">Vui lòng chờ một chút nhé 😊</p>
    </div>
  );
}