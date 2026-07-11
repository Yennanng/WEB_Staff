import Link from 'next/link';
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from 'sonner';

const stats = [
    {
        value: "98%",
        label: "Khách hàng hài lòng",
    },
    {
        value: "800+",
        label: "Thú cưng được chăm sóc",
    },
];

const galleryItems = [
    {
        src: "/images/cat_yellow.png",
        alt: "Mèo cưng nằm",
        className: "aspect-[270/478]",
    },
    {
        src: "/images/cat_pink.png",
        alt: "Chân mèo dễ thương",
        className: "aspect-[270/418]",
    },
];

const avatarItems = [
    { src: "/images/dog.png", alt: "Chó cưng vui vẻ" },
    { src: "/images/cat_hero.png", alt: "Mèo vui vẻ" },
];

export default function HeroSection() {
    const [phone, setPhone] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const phoneInputId = useId();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!phone.trim()) {
            toast.error("Vui lòng nhập số điện thoại!");
            return;
        }
        setShowSuccessModal(true);
        setPhone("");
    };

    return (
        <main className="w-full bg-[#f7f7f7]">
            <section
                className="relative w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-10 py-10 lg:py-14"
                aria-labelledby="hero-title"
            >
                {/* ===== Top block: intro text + dog photo ===== */}
                <div className="relative grid grid-cols-1 lg:grid-cols-2 rounded-[2rem] lg:rounded-[0_180px_0_0] overflow-hidden">
                    {/* Text panel */}
                    <div className="relative bg-[#372f24] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 flex flex-col items-start gap-6 lg:gap-8">
                        <div className="pointer-events-none absolute top-10 left-8 w-40 h-40 bg-[#569930] rounded-full blur-[52px] mix-blend-screen opacity-20" />

                        <h1
                            id="hero-title"
                            className="relative [font-family:'Lora-BoldItalic',Helvetica] font-bold italic text-[#e5ec82] text-[40px] leading-[44px] md:text-[64px] md:leading-[72px] lg:text-[85px] lg:leading-[96px] tracking-[-1.70px] [text-shadow:0_4px_4px_rgba(85,111,48,0.4)]"
                        >
                            Nâng Niu <br className="block md:hidden" /> 
                            Thú Cưng <br /> 
                            <span className="whitespace-nowrap">Cùng PawCare</span>
                        </h1>

                        <p className="relative max-w-[512px] text-[#eff4be] text-base leading-[34px] [font-family:'Inter-Regular',Helvetica] font-normal">
                            PawCare đồng hành cùng bạn trong hành trình nuôi dưỡng cún cưng
                            và mèo cưng. Chúng tôi cung cấp dịch vụ Grooming chuyên nghiệp,
                            khách sạn Pet Hotel tiện nghi cùng không gian mua sắm chuẩn mực.
                        </p>

                        <Link
                            href="#top-services"
                            className="relative inline-flex items-center gap-2.5 px-[18px] py-4 bg-[#1c693d] hover:bg-[#154f2e] transition-colors text-white"
                        >
                            <span className="[font-family:'Inter-Regular',Helvetica] font-normal text-base leading-5">
                                Khám phá ngay
                            </span>
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                    </div>

                    {/* Photo panel */}
                    <div className="relative min-h-[260px] sm:min-h-[360px] lg:min-h-0 bg-[#e88fa8]">
                        <img
                            className="absolute inset-0 w-full h-full object-cover"
                            src="/images/right.png"
                            alt="Chú chó PawCare"
                        />
                    </div>
                </div>

                {/* ===== Bottom block: gallery + stats + signup ===== */}
                <div className="relative grid grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-8 sm:gap-x-6 mt-8 lg:mt-10">
                    {/* Gallery column */}
                    <div className="col-span-2 lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
                        {galleryItems.map((item) => (
                            <div
                                key={item.src}
                                className={`relative w-full ${item.className} rounded-[2rem] overflow-hidden`}
                            >
                                <img
                                    className="absolute inset-0 w-full h-full object-cover"
                                    src={item.src}
                                    alt={item.alt}
                                />
                            </div>
                        ))}

                        {/* Overlapping avatar row */}
                        <div className="col-span-2 flex items-center gap-4 sm:gap-6 -mt-16 sm:-mt-20 pl-2">
                            {avatarItems.map((item) => (
                                <div
                                    key={item.src}
                                    className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-[130px] lg:h-[130px] rounded-full overflow-hidden ring-4 ring-[#f7f7f7]"
                                >
                                    <img
                                        className="absolute inset-0 w-full h-full object-cover"
                                        src={item.src}
                                        alt={item.alt}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats + signup column */}
                    <div className="col-span-2 lg:col-span-6 flex flex-col gap-10 lg:gap-12 lg:pl-4">
                        <div className="grid grid-cols-2 gap-6">
                            {stats.map((stat) => (
                                <div key={stat.value} className="flex flex-col items-start">
                                    <span className="[font-family:'Inter-Bold',Helvetica] font-bold text-[56px] md:text-[72px] lg:text-[94px] tracking-[-1.00px] leading-[64px] md:leading-[80px] lg:leading-[124px] text-black">
                                        {stat.value}
                                    </span>
                                    <p className="mt-2 w-auto max-w-[201px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#030605] text-lg lg:text-2xl tracking-[1.00px] leading-6 lg:leading-8">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-start gap-6 lg:gap-8 overflow-hidden w-full">
                            <h2 className="w-full text-center md:text-left [font-family:'Inter-Regular',Helvetica] font-normal text-[#030605] text-[32px] md:text-[42px] tracking-[-0.84px] leading-[38px] md:leading-[46px]">
                                Đăng Ký Nhận <br className="block md:hidden" /> Ưu Đãi Ngay
                            </h2>

                            <form
                                className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0"
                                onSubmit={handleSubmit}
                            >
                                <label htmlFor={phoneInputId} className="sr-only">
                                    Nhập số điện thoại của bạn
                                </label>
                                <div className="flex-1 min-w-0 flex items-center bg-[#f5f7e3] px-6 py-4">
                                    <input
                                        id={phoneInputId}
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        placeholder="Nhập số điện thoại của bạn"
                                        className="w-full bg-transparent text-[#030605] placeholder:text-[#5c5e5e] text-xl leading-[26px] outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="shrink-0 inline-flex items-center justify-center bg-[#1c693d] hover:bg-[#154f2e] transition-colors px-8 py-4 text-white"
                                >
                                    <span className="[font-family:'Inter-Regular',Helvetica] font-normal text-xl leading-[26px]">
                                        Nhận ưu đãi
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-gray-100 transform scale-100 transition-all duration-300">
                        <div className="w-16 h-16 bg-[#EFF4BD] text-[#1c693d] rounded-full flex items-center justify-center mx-auto text-3xl">
                            🐾
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-[#23361A]">Đăng ký nhận ưu đãi</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Cảm ơn bạn đã liên hệ, chúng tôi sẽ liên hệ với bạn sớm!
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-[#1c693d] hover:bg-[#154f2e] text-white font-semibold py-3.5 rounded-full transition-colors cursor-pointer"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}