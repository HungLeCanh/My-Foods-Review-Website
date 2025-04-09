"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const cities = ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh"];

export default function BusinessRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    image: null as File | null, // Đổi thành null vì sẽ lưu file
    address: "",
    city: cities[0],
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === "image") {
      const file = (e.target as HTMLInputElement).files?.[0] || null; // Ép kiểu để dùng .files
      setForm({ ...form, image: file });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setUploading(true);
    let imageUrl = "";

    if (form.image) {
      const imageData = new FormData();
      imageData.append("file", form.image);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: imageData,
      });

      if (!uploadRes.ok) {
        setError("Lỗi tải ảnh lên");
        setUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url; // Nhận về URL ảnh từ API
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

    setUploading(false);

    if (res.ok) {
      router.push("/pages/login");
    } else {
      const data = await res.json();
      setError(data.error || "Đăng ký thất bại");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">Đăng ký Doanh Nghiệp Nhà Hàng</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
  
        <form onSubmit={handleSubmit} className="space-y-5 text-sm text-gray-600">
          <div>
            <input
              name="name"
              type="text"
              placeholder="VD: Nhà hàng ABC"
              required
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            />
            <p className="mt-1 text-gray-500">Tên doanh nghiệp bạn muốn hiển thị cho khách hàng.</p>
          </div>
  
          <div>
            <input
              name="email"
              type="email"
              placeholder="VD: abc@example.com"
              required
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            />
            <p className="mt-1 text-gray-500">Email sẽ dùng để đăng nhập và nhận thông báo.</p>
          </div>
  
          <div>
            <input
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              required
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            />
            <p className="mt-1 text-gray-500">Mật khẩu cần có ít nhất 6 ký tự.</p>
          </div>
  
          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận lại mật khẩu"
              required
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            />
            <p className="mt-1 text-gray-500">Nhập lại mật khẩu để xác nhận.</p>
          </div>
  
          <div>
            <textarea
              name="description"
              placeholder="Mô tả ngắn về doanh nghiệp, dịch vụ, món ăn nổi bật..."
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            />
            <p className="mt-1 text-gray-500">Thông tin này sẽ hiển thị trong trang giới thiệu nhà hàng.</p>
          </div>
  
          <div>
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            />
            <p className="mt-1 text-gray-500">Tải lên logo hoặc hình ảnh nổi bật của nhà hàng.</p>
          </div>
  
          <div>
            <input
              name="address"
              type="text"
              placeholder="VD: 123 Lê Lợi, P. Bến Nghé"
              required
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            />
            <p className="mt-1 text-gray-500">Địa chỉ cụ thể để khách dễ dàng tìm kiếm.</p>
          </div>
  
          <div>
            <select
              name="city"
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-md text-black"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <p className="mt-1 text-gray-500">Chọn thành phố nơi doanh nghiệp đang hoạt động.</p>
          </div>
  
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 w-full rounded-md font-semibold hover:bg-blue-600 transition duration-200"
          >
            {uploading ? "Đang tải ảnh..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );  
}
