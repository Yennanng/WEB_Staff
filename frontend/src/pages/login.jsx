import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authenticateCustomer } from '@/services/supabase/supabaseUsersApi';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneOrEmail.trim()) {
      toast.error('Vui lòng nhập số điện thoại hoặc email');
      return;
    }
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateCustomer(phoneOrEmail.trim(), password);

      if (res.success) {
        toast.success(`Chào mừng ${res.user.first_name || 'Người dùng'} trở lại!`);

        // Dùng AuthContext.login() để đồng bộ state toàn cục
        if (res.role === 'Customer') {
          login(res.user); // cập nhật AuthContext + localStorage cùng lúc
          setTimeout(() => {
            router.push(ROUTES.CUSTOMER.LANDING);
          }, 1200);
        } else {
          // Staff không qua AuthContext (dùng key riêng 'staff_user')
          localStorage.setItem('staff_user', JSON.stringify(res.user));
          setTimeout(() => {
            router.push(ROUTES.STAFF.USERS);
          }, 1200);
        }
      } else {
        toast.error(res.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EFF4BD] font-sans">
      
      {/* Left Column: Form & Brand */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16 min-h-screen">
        
        {/* Empty placeholder to push brand content to center vertically */}
        <div className="hidden md:block"></div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-8">
          {/* Brand header */}
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-5xl font-extrabold text-[#1B693C] tracking-wide font-sans">
              PAWCARE
            </h1>
            <p className="text-wood-bark/60 italic font-medium">
              Chào mừng bạn trở lại!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone or Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-wood-bark/80 uppercase tracking-wider ml-1">
                Số điện thoại hoặc Email
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-wood-bark/50 group-focus-within:text-[#1B693C] transition-colors">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Hãy nhập số điện thoại hoặc email"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full py-3.5 pl-12 pr-4 bg-white border-2 border-wood-bark/10 rounded-full outline-none text-sm text-wood-bark placeholder-gray-400 focus:border-[#1B693C] focus:ring-1 focus:ring-[#1B693C]/20 transition-all font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-wood-bark/80 uppercase tracking-wider ml-1">
                Mật khẩu
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-wood-bark/50 group-focus-within:text-[#1B693C] transition-colors">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Hãy nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3.5 pl-12 pr-12 bg-white border-2 border-wood-bark/10 rounded-full outline-none text-sm text-wood-bark placeholder-gray-400 focus:border-[#1B693C] focus:ring-1 focus:ring-[#1B693C]/20 transition-all font-medium shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-wood-bark/40 hover:text-wood-bark transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Forgot password link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs italic text-wood-bark/70 hover:text-[#1B693C] hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Login & Register buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#1B693C] px-10 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-moss-green transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
              
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#A2B447] px-10 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#556F30] transition-all hover:scale-105 active:scale-95"
              >
                Đăng ký
              </Link>
            </div>
          </form>
        </div>

        {/* Footer pet preview images */}
        <div className="flex gap-4 justify-center md:justify-start pt-8 border-t border-wood-bark/10">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md bg-white p-1 border border-white/50 hover:scale-105 transition-transform duration-200">
            <img src="/images/pet_hat.png" alt="Pet Hat" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md bg-white p-1 border border-white/50 hover:scale-105 transition-transform duration-200">
            <img src="/images/cat_hood.png" alt="Cat Hood" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md bg-white p-1 border border-white/50 hover:scale-105 transition-transform duration-200">
            <img src="/images/paws.png" alt="Paws" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>

      </div>

      {/* Right Column: Hero Dog Photo */}
      <div className="w-full md:w-1/2 min-h-[450px] md:min-h-screen p-4 md:p-8 flex relative shrink-0">

        {/* Curved Container with Background Image */}
        <div className="w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative select-none">
          <img 
            src="/images/login_dog.png" 
            alt="Dog running with green ball" 
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] hover:scale-100 transition-transform duration-700" 
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        </div>

      </div>

    </div>
  );
}
