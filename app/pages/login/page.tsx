"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Thêm trạng thái lỗi
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset lỗi khi bắt đầu đăng nhập

    try {
      // Xóa hoàn toàn session hiện tại
      await signOut({ redirect: false });
      
      // Xóa cookie session thủ công
      document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Đợi một khoảng thời gian
      await new Promise(resolve => setTimeout(resolve, 800));

      const callbackUrl = activeTab === "business" ? "/pages/business_home" : "/";

      console.log(`Đang đăng nhập với email: ${form.email}, loại tài khoản: ${activeTab}`);
      
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.");
      } else {
        // Đợi một chút để session được cập nhật
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(callbackUrl);
      }
    } catch (error) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error("Lỗi trong quá trình đăng nhập:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">Đăng nhập</h2>
        
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 p-2 text-center ${activeTab === "user" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("user")}
          >
            Người dùng
          </button>
          <button
            className={`flex-1 p-2 text-center ${activeTab === "business" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("business")}
          >
            Doanh nghiệp
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            required
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className={`bg-blue-500 text-white p-3 w-full rounded-md font-semibold hover:bg-blue-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : `Đăng nhập ${activeTab === "business" ? "cho Doanh nghiệp" : "cho Người dùng"}`}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản? 
            <button
              onClick={() => router.push("/pages/register")}
              className="text-blue-500 hover:underline ml-1"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
