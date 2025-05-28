"use client";

import { signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reset error when tab changes
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up session
      await signOut({ redirect: false });
      
      const callbackUrl = activeTab === "business" ? "/pages/business_home" : "/pages/home";
      
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.");
      } else {
        // Short delay before redirect
        await new Promise(resolve => setTimeout(resolve, 300));
        router.push(callbackUrl);
      }
    } catch (error) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error("Lỗi đăng nhập:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // // Redirect to forgot password page
    // router.push("/pages/forgot_password");
    alert("Chức năng quên mật khẩu chưa được triển khai.");
  };

return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
    <div className="relative bg-white shadow-xl rounded-2xl w-full max-w-md overflow-hidden">
      {/* Logo và trang trí phía trên */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-6 text-center">
        <div className="flex justify-center items-center mb-2">
          <span className="text-4xl mr-2" role="img" aria-label="bowl">🍜</span>
          <h1 className="text-3xl font-bold text-white">FoodPin</h1>
          <span className="text-4xl ml-2" role="img" aria-label="pin">📍</span>
        </div>
        <p className="text-white text-opacity-90 text-sm">Khám phá và chia sẻ địa điểm ăn uống yêu thích</p>
      </div>

      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-orange-700">Đăng nhập tài khoản</h2>
        
        {/* Tab chuyển đổi */}
        <div className="flex rounded-lg border border-orange-200 mb-6 overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-3 px-2 text-sm sm:text-base transition-colors duration-200 ${
              activeTab === "user" 
                ? "bg-orange-500 text-white font-medium" 
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
            onClick={() => setActiveTab("user")}
          >
            Người dùng
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-2 text-sm sm:text-base transition-colors duration-200 ${
              activeTab === "business" 
                ? "bg-orange-500 text-white font-medium" 
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
            onClick={() => setActiveTab("business")}
          >
            Doanh nghiệp
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-orange-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-orange-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your-email@example.com"
                required
                value={form.email}
                onChange={handleChange}
                className="pl-10 pr-3 py-3 border border-orange-200 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50 transition-colors duration-200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-orange-700">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-orange-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={handleChange}
                className="pl-10 pr-3 py-3 border border-orange-200 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50 transition-colors duration-200"
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center">
                <div className="text-red-500 flex-shrink-0">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <p className="ml-2 text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              onClick={handleForgotPassword} 
              type="button" 
              className="text-sm text-orange-600 hover:text-orange-800 hover:underline transition-colors duration-200"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              `Đăng nhập ${activeTab === "business" ? "Doanh nghiệp" : "Người dùng"}`
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={() => router.push("/pages/register")}
              className="text-orange-600 font-medium hover:text-orange-800 hover:underline transition-colors duration-200"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
      
      {/* Trang trí phía dưới */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 h-4" />
    </div>
  </div>
);
}