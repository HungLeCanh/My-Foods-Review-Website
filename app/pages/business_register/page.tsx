"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, CheckCircle, FileText, MapPin, Image, MapPinned } from "lucide-react";

const cities = ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh"];

export default function BusinessRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    image: null as File | null,
    address: "",
    city: cities[0],
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === "image" && (e.target as HTMLInputElement).files?.[0]) {
      const file = (e.target as HTMLInputElement).files?.[0] ?? null;
      setForm({ ...form, image: file });
      
      // Tạo preview cho hình ảnh
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
    
    // Xóa thông báo lỗi khi người dùng thay đổi dữ liệu
    if (error) setError("");
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
      return;
    }

    setUploading(true);
    let imageUrl = "";

    try {
      if (form.image) {
        const imageData = new FormData();
        imageData.append("file", form.image);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: imageData,
        });

        if (!uploadRes.ok) {
          throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const businessData = {
        name: form.name,
        email: form.email,
        password: form.password,
        description: form.description,
        image: imageUrl,
        address: `${form.address}, ${form.city}`,
      };

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Đăng ký thất bại. Vui lòng thử lại sau.");
      }

      // Đăng ký thành công
      router.push("/pages/login?registered=business");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-2xl">
        {/* Header thương hiệu */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-6 text-center">
          <div className="flex justify-center items-center mb-2">
            <span className="text-4xl mr-2">🍜</span>
            <h1 className="text-3xl font-bold text-white">FoodPin</h1>
            <span className="text-4xl ml-2">📍</span>
          </div>
          <p className="text-white text-opacity-90">Đăng ký nhà hàng của bạn và kết nối với hàng ngàn thực khách</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-orange-700">Đăng ký Nhà Hàng / Quán Ăn</h2>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-orange-700">Tên nhà hàng</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 size={18} className="text-orange-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="VD: Nhà hàng Phở Ngon"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="pl-10 border border-orange-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Tên hiển thị trên ứng dụng cho thực khách</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-orange-700">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-orange-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="VD: nhahang@example.com"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="pl-10 border border-orange-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Dùng cho đăng nhập và nhận thông báo đặt bàn</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-orange-700">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-orange-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="pl-10 border border-orange-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-orange-500 hover:text-orange-700"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Tối thiểu 8 ký tự bao gồm chữ và số</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-orange-700">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle size={18} className="text-orange-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 border border-orange-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-orange-700">Mô tả nhà hàng</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText size={18} className="text-orange-400" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Mô tả ngắn về nhà hàng, đặc trưng ẩm thực, món ăn nổi bật..."
                      value={form.description}
                      onChange={handleChange}
                      className="pl-10 border border-orange-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Thông tin này sẽ hiển thị trong trang chi tiết nhà hàng</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-orange-700">Địa chỉ</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={18} className="text-orange-400" />
                    </div>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="VD: 123 Lê Lợi, P. Bến Nghé"
                      required
                      value={form.address}
                      onChange={handleChange}
                      className="pl-10 border border-orange-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Địa chỉ chính xác để khách hàng dễ dàng tìm thấy</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-medium text-orange-700">Thành phố</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinned size={18} className="text-orange-400" />
                    </div>
                    <select
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="pl-10 border border-orange-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-orange-50"
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="image" className="block text-sm font-medium text-orange-700">Hình ảnh nhà hàng</label>
                  <div className="relative">
                    <div className="flex items-center">
                      <label htmlFor="image" className="flex items-center justify-center w-full cursor-pointer border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg p-4 hover:bg-orange-100 transition">
                        <div className="flex flex-col items-center">
                          <Image size={24} className="text-orange-500 mb-2" />
                          <span className="text-sm text-orange-700">Nhấn để chọn ảnh</span>
                        </div>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {previewImage && (
                    <div className="mt-3">
                      <div className="relative w-full h-32 bg-orange-50 rounded-lg overflow-hidden">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setForm({...form, image: null});
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Tải lên logo hoặc hình ảnh đại diện của nhà hàng</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 px-4 w-full rounded-lg font-medium hover:from-orange-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  "Đăng ký nhà hàng"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <button
                onClick={() => router.push("/pages/login")}
                className="text-orange-600 font-medium hover:text-orange-800 hover:underline transition-colors"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 h-4"></div>
      </div>
    </div>
  );
}