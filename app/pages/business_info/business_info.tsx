'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Food {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface Business {
  id: string;
  name: string;
  email: string;
  image?: string;
  description?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  foods: Food[];
}

export default function BusinessInfoPage() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('id');
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/businesses?id=${businessId}`);
        const data = await res.json();
        if (data.business) {
          setBusiness(data.business);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin doanh nghiệp:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  if (loading) return <p>Đang tải thông tin doanh nghiệp...</p>;
  if (!business) return <p>Không tìm thấy doanh nghiệp.</p>;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero section with business info */}
      <div className="relative">
        {business.image ? (
          <div className="h-64 md:h-80 lg:h-96 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10"></div>
            <img
              src={business.image}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-40 md:h-60 bg-amber-700"></div>
        )}
        
        {/* Business info overlay */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className={`${business.image ? "-mt-24" : "-mt-12"} relative z-20`}>
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-amber-900">{business.name}</h1>
                  <p className="text-amber-700 mt-1">{business.email}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-green-600"></span>
                    Đang hoạt động
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                {business.description && (
                  <div className="prose text-gray-700 max-w-none">
                    <p className="italic">{business.description}</p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="ml-2">{business.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="ml-2">Đăng ký: {new Date(business.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* Food menu section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="flex items-center justify-between mb-6 border-b border-amber-200 pb-2">
          <h2 className="text-2xl font-bold text-amber-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Thực đơn
          </h2>
          <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
            {business.foods.length} món
          </span>
        </div>
  
        {business.foods.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18 12H6m9-5l-5 5m0 0l-5-5" />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-amber-900">Chưa có món ăn</h3>
            <p className="mt-1 text-gray-500">Doanh nghiệp chưa thêm món ăn nào vào thực đơn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {business.foods.map((food) => (
              <div key={food.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-amber-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {food.category && (
                    <span className="absolute top-3 right-3 bg-white/90 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                      {food.category}
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-amber-900">{food.name}</h3>
                    <div className="text-amber-700 font-bold">{food.price.toLocaleString('vi-VN')}₫</div>
                  </div>
                  
                  {food.description && (
                    <p className="mt-2 text-gray-600 text-sm line-clamp-2">{food.description}</p>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Cập nhật: {new Date(food.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                    <button className="flex items-center text-amber-600 text-sm font-medium hover:text-amber-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Yêu thích
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
