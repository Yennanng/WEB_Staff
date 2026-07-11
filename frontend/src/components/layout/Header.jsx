import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Custom Paw icon matching the brand identity
const PawIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main Pad */}
    <path d="M12 14c-1.8 0-3.2 1.4-3.2 3.2 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2c0-1.8-1.4-3.2-3.2-3.2z" />
    {/* Toes (left to right) */}
    <circle cx="6" cy="11.5" r="1.8" />
    <circle cx="9.5" cy="7.5" r="1.8" />
    <circle cx="14.5" cy="7.5" r="1.8" />
    <circle cx="18" cy="11.5" r="1.8" />
  </svg>
);

export default function Header({ activePath, cartCount }) {
  const router = useRouter();
  const currentPath = activePath || router.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();          // ← dùng AuthContext
  const { cartItems } = useCart();
  const totalCartCount = cartCount !== undefined ? cartCount : (cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0);

  const handleLogout = () => {
    logout(); // AuthContext xử lý: xóa localStorage + reset state + redirect '/'
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Giới thiệu', path: '/gioi_thieu' },
    { name: 'Sản phẩm', path: '/san_pham' },
    { name: 'Dịch vụ chăm sóc', path: '/customer/booking/dich_vu_cham_soc' },
    { name: 'Dịch vụ lưu trú', path: '/customer/booking/dich_vu_luu_tru' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san_pham?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-fresh-grown shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <PawIcon className="w-7 h-7 text-[#1B693C] transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold text-wood-bark font-sans tracking-tight">
              PawCare
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative py-1 text-sm font-medium transition-colors hover:text-understory ${
                    isActive 
                      ? 'text-understory font-bold' 
                      : 'text-wood-bark/80 hover:text-wood-bark'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-understory rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search, Cart & Auth actions */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md justify-end">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative w-full max-w-xs group">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-understory transition-colors">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm và dịch vụ"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 pl-9 pr-4 bg-white border-none rounded-full outline-none text-xs text-wood-bark placeholder-gray-400/80 shadow-inner focus:ring-1 focus:ring-understory/20 transition-all"
              />
            </form>

            {/* Cart Icon */}
            <Link 
              href={ROUTES.CUSTOMER.SHOP.CART} 
              className="relative p-2 text-wood-bark/90 hover:text-understory hover:bg-white/30 rounded-full transition-all"
            >
              <ShoppingBag size={20} />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-wood-bark/80 text-[10px] font-bold text-white">
                {totalCartCount}
              </span>
            </Link>

            {/* User Session Info or Login Button */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* ĐÃ SỬA: Thay text bằng Avatar có bọc Link */}
                <Link 
                  href="/customer/profile/tai_khoan"
                  className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-azeitona text-white font-bold text-sm hover:ring-2 hover:ring-understory transition-all"
                  title="Tài khoản của tôi"
                >
                  {user.cus_ava ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.cus_ava} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    (user.first_name?.[0] || 'U').toUpperCase()
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-wood-bark/20 hover:bg-wood-bark/30 px-3.5 py-1.5 text-xs font-bold text-wood-bark transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-azeitona px-5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-fig-leaf transition-all hover:scale-105 active:scale-95"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Right Controls (Cart, Menu Toggle) */}
          <div className="flex md:hidden items-center gap-3">
            <Link 
              href={ROUTES.CUSTOMER.SHOP.CART} 
              className="relative p-2 text-wood-bark hover:text-understory rounded-full"
            >
              <ShoppingBag size={20} />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-wood-bark/80 text-[10px] font-bold text-white">
                {totalCartCount}
              </span>
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-wood-bark hover:text-understory rounded-lg hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-fresh-grown/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-inner">
          {/* Search inside Mobile Menu */}
          <form onSubmit={handleSearch} className="relative w-full group">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm và dịch vụ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-9 pr-4 bg-white border-none rounded-full outline-none text-sm text-wood-bark placeholder-gray-400/80 shadow-sm"
            />
          </form>

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white/40 text-understory font-bold' 
                      : 'text-wood-bark/90 hover:bg-white/20 hover:text-understory'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Login Button or User Info */}
          <div className="pt-2 border-t border-white/20">
            {user ? (
              <div className="flex flex-col gap-3">
                {/* ĐÃ SỬA: Layout Profile cho Mobile */}
                <Link 
                  href="/customer/profile/tai_khoan"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 transition-colors"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-azeitona text-white font-bold text-lg">
                    {user.cus_ava ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.cus_ava} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      (user.first_name?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-wood-bark">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-xs text-wood-bark/70">Quản lý tài khoản</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center rounded-full bg-wood-bark/20 py-2 text-sm font-semibold text-wood-bark hover:bg-wood-bark/30 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-azeitona py-2 text-sm font-semibold text-white shadow-sm hover:bg-fig-leaf transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}