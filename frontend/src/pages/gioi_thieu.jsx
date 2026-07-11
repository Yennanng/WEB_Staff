import React, { useState } from 'react';
import CusLayout from '@/components/layout/CusLayout';
import { Scissors, Hotel, ShoppingBag, Clock, XCircle, Mail, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Gửi lời nhắn thành công! Chúng tôi sẽ phản hồi bạn sớm.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CusLayout activePath="/gioi_thieu">
      {/* SECTION 1: ABOUT / HERO */}
      <section 
        id="about"
        className="relative bg-cover bg-center py-32 md:py-40 flex items-center justify-center text-center text-white scroll-mt-16"
        style={{
          backgroundImage: `linear-gradient(rgba(35, 54, 26, 0.75), rgba(35, 54, 26, 0.75)), url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1920&auto=format&fit=crop')`
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-sans tracking-tight leading-tight">
            Nâng Tầm Cuộc Sống <br /> Thú Cưng
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 font-sans">
            Chúng tôi cung cấp hệ sinh thái dịch vụ toàn diện từ Grooming chuyên nghiệp, Khách sạn chuẩn 5 sao đến các sản phẩm thiết yếu cao cấp cho người bạn nhỏ của bạn.
          </p>
          <a 
            href="#contact" 
            className="inline-block bg-[#A2B447] text-[#23361A] hover:bg-[#56992F] hover:text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Liên Hệ Đặt Lịch
          </a>
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#23361A] mb-12">
            Dịch Vụ Cốt Lõi Tại Cửa Hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-b-4 hover:border-b-[#56992F]">
              <div className="w-16 h-16 bg-[#EFF4BD] text-[#23361A] rounded-full flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#23361A] mb-3">Pet Grooming</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Cắt tỉa, tắm spa tạo kiểu chuyên nghiệp từ các chuyên viên am hiểu tâm lý thú cưng.
              </p>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-b-4 hover:border-b-[#56992F]">
              <div className="w-16 h-16 bg-[#EFF4BD] text-[#23361A] rounded-full flex items-center justify-center mx-auto mb-6">
                <Hotel className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#23361A] mb-3">Pet Hotel</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Không gian lưu trú sạch sẽ, chuẩn điều hòa, có camera giám sát và chế độ dinh dưỡng riêng biệt.
              </p>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-b-4 hover:border-b-[#56992F]">
              <div className="w-16 h-16 bg-[#EFF4BD] text-[#23361A] rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#23361A] mb-3">Pet Shop</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Cung cấp thức ăn hạt phụ kiện, đồ chơi và các thực phẩm chức năng nhập khẩu chính hãng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop" 
                alt="Pet Care"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[#23361A] leading-tight">
                Hành Trình Tạo Nên <span className="text-[#56992F]">Sự Khác Biệt</span>
              </h2>
              <p className="text-[#362F22] leading-relaxed">
                Khởi nguồn từ tình yêu vô điều kiện với động vật, Paws & Friends không chỉ đơn thuần là một cửa hàng dịch vụ. Chúng tôi xây dựng một không gian an tâm, nơi thú cưng của bạn được chăm sóc bằng chuyên môn cao nhất cùng tình yêu thương như chính gia đình bạn.
              </p>
              <p className="text-[#362F22] leading-relaxed">
                Mỗi quy trình xử lý tại tiệm từ việc tắm sấy đến không gian phòng ủ ấm cho dịch vụ Hotel đều hướng tới trải nghiệm thoải mái, không gây căng thẳng (stress-free) cho thú cưng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM EXPERTS SECTION */}
      <section id="experts" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#23361A] mb-16">
            Đội Ngũ Chuyên Gia Thân Thiện
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Member 1 */}
            <div className="space-y-4">
              <div className="w-36 h-36 rounded-full overflow-hidden mx-auto border-4 border-[#EFF4BD] shadow-sm">
                <img 
                  src="/images/dang_uyen.png" 
                  alt="Đang Uyên"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-[#23361A]">Đang Uyên</h4>
              <p className="text-[#56992F] font-semibold text-xs">Bác sĩ Thú y</p>
            </div>

            {/* Member 2 */}
            <div className="space-y-4">
              <div className="w-36 h-36 rounded-full overflow-hidden mx-auto border-4 border-[#EFF4BD] shadow-sm">
                <img 
                  src="/images/my_duyen.png" 
                  alt="Mỹ Duyên"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-[#23361A]">Mỹ Duyên</h4>
              <p className="text-[#56992F] font-semibold text-xs">Chuyên viên Grooming</p>
            </div>

            {/* Member 3 */}
            <div className="space-y-4">
              <div className="w-36 h-36 rounded-full overflow-hidden mx-auto border-4 border-[#EFF4BD] shadow-sm">
                <img 
                  src="/images/yen_ngan.png" 
                  alt="Yến Ngân"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-[#23361A]">Yến Ngân</h4>
              <p className="text-[#56992F] font-semibold text-xs">Quản lý Khách sạn</p>
            </div>

            {/* Member 4 */}
            <div className="space-y-4">
              <div className="w-36 h-36 rounded-full overflow-hidden mx-auto border-4 border-[#EFF4BD] shadow-sm">
                <img 
                  src="/images/phuong_nghi.png" 
                  alt="Phương Nghi"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-[#23361A]">Phương Nghi</h4>
              <p className="text-[#56992F] font-semibold text-xs">Tư vấn Dinh dưỡng</p>
            </div>

            {/* Member 5 */}
            <div className="space-y-4">
              <div className="w-36 h-36 rounded-full overflow-hidden mx-auto border-4 border-[#EFF4BD] shadow-sm">
                <img 
                  src="/images/bao_quoc.png" 
                  alt="Bảo Quốc"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-[#23361A]">Bảo Quốc</h4>
              <p className="text-[#56992F] font-semibold text-xs">Huấn luyện viên</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CONTACT & FORM SECTION */}
      <section 
        id="contact" 
        className="bg-[#FAFCFD] py-20 border-t border-gray-100 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Info panel */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#23361A] mb-4">Thời Gian Làm Việc</h2>
                <p className="text-[#362F22] mb-6">Đừng ngần ngại liên hệ đặt lịch trước để bé cưng của bạn không phải xếp hàng chờ đợi lâu nhé!</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#362F22]">
                    <Clock className="w-5 h-5 text-[#56992F]" />
                    <span>Thứ Hai - Thứ Sáu : 7AM - 8PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#362F22]">
                    <Clock className="w-5 h-5 text-[#56992F]" />
                    <span>Thứ Bảy : 8AM - 6PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#d9534f]">
                    <XCircle className="w-5 h-5 text-[#d9534f]" />
                    <span>Chủ Nhật (Ngày Nghỉ / Chỉ Nhận Hotel)</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-[#23361A] mb-4">Vị Trí Cửa Hàng</h2>
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5201952559787!2d106.6880843760962!3d10.771417359286698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3c59223e71%3A0x6795f9d231998fdf!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                    title="Cửa hàng Paws & Friends"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[32px] shadow-lg border border-gray-100">
              <span className="inline-block border border-gray-300 px-4 py-1 rounded-full text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Liên hệ
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#23361A] mb-8 font-sans">
                Liên Hệ Với Chúng Tôi
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-[#362F22] px-1">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#F4F6E9] border border-dashed border-[#c2c6a9] rounded-full py-3.5 pl-12 pr-6 text-sm text-[#362F22] outline-none focus:border-solid focus:border-[#56992F] focus:bg-white transition-all"
                      placeholder="Nhập email của bạn..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-[#362F22] px-1">
                    Họ và Tên
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#F4F6E9] border border-dashed border-[#c2c6a9] rounded-full py-3.5 pl-12 pr-6 text-sm text-[#362F22] outline-none focus:border-solid focus:border-[#56992F] focus:bg-white transition-all"
                      placeholder="Nhập tên của bạn..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-[#362F22] px-1">
                    Lời nhắn / Yêu cầu đặt lịch
                  </label>
                  <div className="relative">
                    <span className="absolute top-4 left-4 pointer-events-none text-gray-400">
                      <MessageSquare className="w-5 h-5" />
                    </span>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className="w-full bg-[#F4F6E9] border border-dashed border-[#c2c6a9] rounded-3xl py-3.5 pl-12 pr-6 text-sm text-[#362F22] outline-none focus:border-solid focus:border-[#56992F] focus:bg-white resize-none transition-all"
                      placeholder="Bé cưng nhà bạn cần đặt lịch dịch vụ nào..."
                      required
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#A2B447] text-[#23361A] hover:bg-[#56992F] hover:text-white font-bold py-4 rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi đi'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </CusLayout>
  );
}
