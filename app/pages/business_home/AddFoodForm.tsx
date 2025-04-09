"use client";

import { useState } from "react";

export default function AddFoodForm({
  onClose,
  onFoodAdded,
  categories,
}: {
  onClose: () => void;
  onFoodAdded: (food: any) => void;
  categories: string[];
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";

    if (file) {
      const data = new FormData();
      data.append("file", file); // ✅ dùng file thay vì form.image

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const uploadResult = await uploadRes.json();

      if (!uploadRes.ok) {
        alert("Lỗi khi tải ảnh lên");
        return;
      }

      imageUrl = uploadResult.url; // ví dụ: "1712400000-image.jpg"
    }

    const response = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        image: imageUrl,
        category: form.category,
      }),
    });

    if (!response.ok) {
      alert("Thêm món thất bại");
      return;
    }

    const newFood = await response.json();
    onFoodAdded(newFood);
    onClose();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 my-4 relative border">
      <h3 className="text-lg font-bold mb-4">Thêm món mới</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Tên món"
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Mô tả"
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          placeholder="Giá"
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            Thêm món
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black p-2 rounded-md"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
