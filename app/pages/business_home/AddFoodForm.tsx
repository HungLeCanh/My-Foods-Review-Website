"use client";
import { useState } from "react";
import { Info } from "lucide-react";

export default function AddFoodForm({
  onClose,
  onFoodAdded,
  categories = [], // Add default empty array to prevent undefined error
}: {
  onClose: () => void;
  onFoodAdded: (food: any) => void;
  categories?: string[]; // Make categories optional
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Clear error when field is edited
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      // Clear error
      if (errors.image) {
        setErrors({ ...errors, image: "" });
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập tên món";
    if (!form.description.trim()) newErrors.description = "Vui lòng nhập mô tả";
    if (!form.price) newErrors.price = "Vui lòng nhập giá";
    else if (parseFloat(form.price) <= 0) newErrors.price = "Giá phải lớn hơn 0";
    if (!form.category) newErrors.category = "Vui lòng chọn danh mục";
    if (!file) newErrors.image = "Vui lòng tải lên hình ảnh món ăn";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    let imageUrl = "";

    if (file) {
      const data = new FormData();
      data.append("file", file);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        if (!uploadRes.ok) {
          setErrors({ ...errors, image: "Lỗi khi tải ảnh lên" });
          return;
        }

        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.url;
      } catch (error) {
        setErrors({ ...errors, image: "Lỗi khi tải ảnh lên" });
        return;
      }
    }

    try {
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
    } catch (error) {
      alert("Đã xảy ra lỗi khi thêm món mới");
    }
  };

  // For preview purposes, use placeholder image when no file is selected
  const previewImage = previewUrl || "/api/placeholder/200/200";

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 my-4 relative border">
      <h3 className="text-xl font-bold mb-6 text-center text-green-700 border-b pb-3">
        Thêm món mới
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tên món <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Nhập tên món ăn (Ví dụ: Phở bò tái)"
            className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-black p-3 w-full rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả chi tiết về món ăn (Ví dụ: Phở bò với nước dùng đậm đà, thịt bò tái mềm)"
            className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} text-black p-3 w-full rounded-md h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Giá (VNĐ) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              name="price"
              type="number"
              step="1000"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="Nhập giá món ăn (Ví dụ: 75000)"
              className={`border ${errors.price ? 'border-red-500' : 'border-gray-300'} text-black p-3 w-full rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500">VNĐ</span>
            </div>
          </div>
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          <p className="text-gray-500 text-xs flex items-center">
            <Info size={12} className="mr-1" /> Nhập giá không cần dấu phẩy hoặc chấm
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hình ảnh <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <div className={`border ${errors.image ? 'border-red-500' : 'border-gray-300'} text-black rounded-md p-3 flex-1`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
            {previewUrl && (
              <div className="w-20 h-20 overflow-hidden rounded-md border border-gray-300">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          <p className="text-gray-500 text-xs flex items-center">
            <Info size={12} className="mr-1" /> Hình ảnh nên có kích thước vuông và rõ nét
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`border ${errors.category ? 'border-red-500' : 'border-gray-300'} text-black p-3 w-full rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          >
            <option value="">-- Chọn danh mục món ăn --</option>
            {Array.isArray(categories) && categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        <div className="pt-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Thêm món
          </button>
        </div>
      </form>
    </div>
  );
}