"use client";

import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [hoverGetStarted, setHoverGetStarted] = useState(false);
  const [hoverBusiness, setHoverBusiness] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-orange-50">
      <Head>
        <title>FoodPin | Khám phá ẩm thực địa phương</title>
        <meta name="description" content="Tìm kiếm món ăn yêu thích và khám phá các nhà hàng địa phương" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header className="bg-amber-700 text-white py-4 px-4 sm:px-6 shadow-md relative">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold">🍜 FoodPin 📍</span>
          </div>
          
          {/* Mobile menu button */}
          <div className="block sm:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden sm:flex space-x-4">
            <Link href="/pages/login">
              <span className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition duration-300">
                Đăng nhập
              </span>
            </Link>
            <Link href="/pages/register">
              <span className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-400 transition duration-300 border border-white">
                Đăng ký
              </span>
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-orange-700 shadow-lg z-50">
            <div className="flex flex-col px-4 py-2">
              <Link href="/pages/login">
                <span className="block py-3 text-center bg-white text-orange-600 rounded-lg font-medium mb-2">
                  Đăng nhập
                </span>
              </Link>
              <Link href="/pages/register">
                <span className="block py-3 text-center bg-orange-500 text-white rounded-lg font-medium border border-white">
                  Đăng ký
                </span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-800 mb-4 sm:mb-6 text-center lg:text-left">
              Khám phá thế giới ẩm thực tại đầu ngón tay
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 text-center lg:text-left">
              FoodPin là nền tảng giúp bạn tìm kiếm các món ăn yêu thích dựa trên sở thích cá nhân. 
              Đồng thời, các doanh nghiệp F&B có thể tạo cửa hàng trực tuyến để trưng bày menu và 
              đặc trưng riêng của mình.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/pages/home">
                <button
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-lg ${
                    hoverGetStarted
                      ? 'bg-orange-500 text-white transform scale-105'
                      : 'bg-orange-600 text-white'
                  } transition-all duration-300 shadow-lg`}
                  onMouseEnter={() => setHoverGetStarted(true)}
                  onMouseLeave={() => setHoverGetStarted(false)}
                >
                  Bắt đầu ngay
                </button>
              </Link>
              <Link href="/pages/business_register">
                <button
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg ${
                    hoverBusiness
                      ? 'bg-white text-orange-600 transform scale-105'
                      : 'bg-orange-100 text-orange-800'
                  } border-2 border-orange-400 transition-all duration-300 shadow-lg`}
                  onMouseEnter={() => setHoverBusiness(true)}
                  onMouseLeave={() => setHoverBusiness(false)}
                >
                  Tạo doanh nghiệp F&B
                </button>
              </Link>
            </div>
          </div>
          
          {/* Image gallery - mobile and desktop versions */}
          <div className="w-full lg:w-1/2 flex justify-center mt-6 lg:mt-0">
            <div className="relative w-full h-72 sm:h-96 lg:h-auto lg:w-full flex justify-center items-center">
              
              {/* Mobile version */}
              <div className="lg:hidden w-full h-full relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/uploads/banh-crepe.jpg"
                  alt="Món ăn nổi bật"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-center font-medium">
                  Khám phá ẩm thực đa dạng
                </div>
              </div>

              {/* Desktop version */}
              <div className="hidden lg:block relative w-full h-[30rem]">
                {/* Image 1 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-orange-200 rounded-lg shadow-xl overflow-hidden h-64 w-64 transition-all duration-300 hover:scale-110 hover:z-20 hover:shadow-2xl">
                  <Image
                    src="/uploads/banh-crepe.jpg"
                    alt="Món ăn nổi bật 1"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300">
                    Bánh crepe
                  </div>
                </div>

                {/* Image 2 */}
                <div className="absolute bottom-0 right-0 bg-orange-200 rounded-lg shadow-xl overflow-hidden h-64 w-64 transition-all duration-300 hover:scale-110 hover:z-20 hover:shadow-2xl">
                  <Image
                    src="/uploads/banh-sung-trau.jpg"
                    alt="Món ăn nổi bật 2"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300">
                    Bánh sừng trâu
                  </div>
                </div>

                {/* Image 3 */}
                <div className="absolute top-1/4 left-0 bg-orange-200 rounded-lg shadow-xl overflow-hidden h-64 w-64 z-10 transition-all duration-300 hover:scale-110 hover:z-20 hover:shadow-2xl">
                  <Image
                    src="/uploads/nha-hang-phap.png"
                    alt="Nhà hàng nội bật"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300">
                    Nhà hàng Pháp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-20 mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-800 mb-8 sm:mb-12">
            Tại sao chọn FoodPin?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-orange-500">🍳</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Tìm kiếm món ăn theo sở thích</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Dễ dàng khám phá các món ăn mới dựa trên sở thích và khẩu vị cá nhân của bạn.
              </p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-orange-500">🏪</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Khám phá nhà hàng địa phương</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Tìm và đánh giá các nhà hàng gần bạn, xem menu và đặt bàn trực tuyến.
              </p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 sm:col-span-2 lg:col-span-1 sm:mx-auto lg:mx-0 sm:w-1/2 lg:w-full">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-orange-500">💼</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Quản lý doanh nghiệp F&B</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Tạo cửa hàng trực tuyến cho doanh nghiệp của bạn, quảng bá menu và tiếp cận khách hàng mới.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-600 rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Sẵn sàng khám phá thế giới ẩm thực?</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Đăng ký ngay hôm nay và bắt đầu hành trình ẩm thực của bạn với FoodPin.
            Hoàn toàn miễn phí cho người dùng cá nhân!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/pages/register">
              <span className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 rounded-xl font-bold text-base sm:text-lg hover:bg-orange-100 transition duration-300">
                Đăng ký ngay
              </span>
            </Link>
            <Link href="/pages/business">
              <span className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 text-white rounded-xl font-bold text-base sm:text-lg border-2 border-white hover:bg-orange-400 transition duration-300">
                Tạo doanh nghiệp F&B
              </span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-amber-700 text-orange-100 py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-bold">🍜 FoodPin 📍</h3>
              <p className="mt-1 text-sm sm:text-base">Khám phá ẩm thực. Kết nối đam mê.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 md:space-x-6">
              <a href="#" className="text-sm sm:text-base hover:text-white transition duration-300">Về chúng tôi</a>
              <a href="#" className="text-sm sm:text-base hover:text-white transition duration-300">Điều khoản</a>
              <a href="#" className="text-sm sm:text-base hover:text-white transition duration-300">Quyền riêng tư</a>
              <a href="#" className="text-sm sm:text-base hover:text-white transition duration-300">Liên hệ</a>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-orange-700 text-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} FoodPin. Chưa đăng ký bản quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}