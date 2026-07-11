import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Landmark, Smartphone, AlertTriangle } from 'lucide-react';
import { getRoomById, createHotelBooking } from '../../services/supabase/customer/booking/hotelService';
import { calculateNights, calculateSubtotal, calculateTax, calculateDeposit, requiresDeposit } from '../../../src/utils/hotelRules';
import { formatVND } from '../../../src/utils/format';
import BookingSummaryCard from '../../../src/components/booking/BookingSummaryCard';

const PAYMENT_METHODS = [
  { id: 'momo', label: 'MoMo', icon: Smartphone },
  { id: 'vnpay', label: 'VNPay', icon: Smartphone },
  { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: Landmark },
];

function buildSpecialNotesText(booking) {
  const e = booking.extra;
  const lines = [
    e.vaccinationUpToDate ? 'Vaccination: Up to date' : 'Vaccination: chưa xác nhận',
    e.medicalConditions ? `Medical conditions: ${e.medicalConditions}` : null,
    e.feedingSchedule ? `Feeding schedule: ${e.feedingSchedule}` : null,
    e.personalBelongings?.length ? `Personal belongings: ${e.personalBelongings.join(', ')}` : null,
    e.walkingPreference ? `Walking preference: ${e.walkingPreference}` : null,
    e.medicationSchedule ? `Medication: ${e.medicationSchedule}` : null,
    e.emergencyName ? `Emergency contact: ${e.emergencyName} (${e.emergencyRelationship || '—'}) - ${e.emergencyPhone || ''}` : null,
    booking.pet.specialNotes || null,
  ].filter(Boolean);
  return lines.join('\n');
}

export default function Step3_Payment({ booking, setBooking, onBack, onConfirmed, lock }) {
  const [phase, setPhase] = useState('review');
  const [room, setRoom] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState(() => `PH-${Math.floor(10000 + Math.random() * 89999)}`);

  useEffect(() => {
    getRoomById(booking.roomId).then(setRoom).catch((e) => console.error(e));
  }, [booking.roomId]);

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const subtotal = calculateSubtotal(room?.price_per_night || 0, nights);
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;
  const needsDeposit = requiresDeposit(total);
  const depositAmount = calculateDeposit(total);
  const amountDue = needsDeposit ? depositAmount : total;

  const finalize = async () => {
    setSubmitError('');
    try {
      let calculatedDob = null;
      if (booking.pet.ageYears) {
        const currentYear = new Date().getFullYear();
        calculatedDob = `${currentYear - parseInt(booking.pet.ageYears)}-01-01`; // Mặc định ngày 1/1
      }

      const finalBookingData = {
        ...booking,
        pet: {
          ...booking.pet,
          dob: calculatedDob || booking.pet.dob
        }
      };

      await createHotelBooking({
        booking: finalBookingData,
        room: room,
        totalBill: total,
        taxAmount: tax,
        orderId: orderId,
        specialNotesText: buildSpecialNotesText(booking)
      });

      setPhase('done');
      onConfirmed?.();
    } catch (e) {
      console.error(e);
      setSubmitError(e.message || 'Có lỗi khi lưu đơn đặt phòng. Vui lòng thử lại.');
      setOrderId(`PH-${Math.floor(10000 + Math.random() * 89999)}`);
      setPhase('review');
    }
  };

  const handleConfirmNoDeposit = () => {
    setPhase('processing');
    finalize();
  };

  const handlePay = () => {
    if (!booking.paymentMethod) return;
    setPhase('processing');
    setTimeout(finalize, 1000);
  };

  if (phase === 'done') {
    return (
      <SuccessScreen
        orderId={orderId}
        total={total}
        amountDue={amountDue}
        needsDeposit={needsDeposit}
        method={booking.paymentMethod}
        petName={booking.pet.name}
        roomName={room ? `Phòng ${room.room_id}` : ''}
        nights={nights}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-wood-bark">Thanh toán</h2>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={16} /> {submitError}
          </div>
        )}

        {!needsDeposit ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
            <p className="text-wood-bark/80 text-sm leading-relaxed">
              Tổng hóa đơn <strong>{formatVND(total)}</strong> nhỏ hơn 1.000.000đ nên booking sẽ được{' '}
              <strong>xác nhận ngay</strong> mà không cần đặt cọc.
            </p>
            <button
              onClick={handleConfirmNoDeposit}
              disabled={phase === 'processing'}
              className="self-start rounded-full bg-understory px-6 py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {phase === 'processing' && <Loader2 size={16} className="animate-spin" />}
              Xác nhận đặt phòng
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-5">
            <p className="text-wood-bark/80 text-sm leading-relaxed">
              Tổng hóa đơn <strong>{formatVND(total)}</strong> (≥ 1.000.000đ) nên cần đặt cọc{' '}
              <strong>30% = {formatVND(depositAmount)}</strong>.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = booking.paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setBooking((prev) => ({ ...prev, paymentMethod: m.id }))}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${isSelected ? 'border-understory bg-fresh-grown/30' : 'border-wood-bark/15 hover:border-understory/50'}`}
                  >
                    <Icon size={18} className="text-understory" />
                    <span className="text-sm font-semibold text-wood-bark">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handlePay}
              disabled={!booking.paymentMethod || phase === 'processing'}
              className="self-start rounded-full bg-understory px-6 py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {phase === 'processing' && <Loader2 size={16} className="animate-spin" />}
              {phase === 'processing' ? 'Đang xử lý...' : `Thanh toán cọc ${formatVND(depositAmount)}`}
            </button>
          </div>
        )}

        <button onClick={onBack} className="self-start text-sm font-semibold text-wood-bark/70 hover:text-understory">
          ← Quay lại điền thông tin
        </button>
      </div>

      <div className="w-full lg:w-[360px]">
        <BookingSummaryCard
          packageInfo={room ? { name: `Phòng ${room.room_id}`, description: `${nights} đêm lưu trú` } : null}
          petLabel={booking.pet.name}
          dateLabel={`${booking.checkIn} → ${booking.checkOut}`}
          breakdown={[
            { label: 'Giá mỗi đêm', amount: room?.price_per_night || 0 },
            { label: `Tạm tính (${nights} đêm)`, amount: subtotal },
            { label: 'Thuế & Phí', amount: tax },
          ]}
          total={total}
          deposit={needsDeposit ? depositAmount : 0}
          ctaLabel="Xem chi tiết đơn"
          ctaDisabled
          lock={lock}
        />
      </div>
    </div>
  );
}

function SuccessScreen({ orderId, total, amountDue, needsDeposit, method, petName, roomName, nights }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-understory text-white">
        <CheckCircle2 size={32} />
      </div>
      <h2 className="text-3xl font-bold text-wood-bark">Đặt phòng thành công!</h2>
      <p className="text-wood-bark/60 max-w-md">
        Lịch lưu trú cho <strong>{petName}</strong> tại <strong>{roomName}</strong> ({nights} đêm) đã được lưu vào hệ thống.
      </p>
      <div className="bg-white rounded-3xl shadow-sm p-6 w-full max-w-md mt-4 text-left flex flex-col gap-3">
        <Row label="Mã đơn" value={`#${orderId}`} />
        <Row label="Phòng" value={roomName} />
        <Row label="Số đêm" value={`${nights} đêm`} />
        <Row label="Tổng hóa đơn" value={formatVND(total)} />
        <Row label={needsDeposit ? 'Đã đặt cọc' : 'Trạng thái'} value={needsDeposit ? formatVND(amountDue) : 'Đã xác nhận'} />
        {needsDeposit && <Row label="Phương thức" value={method === 'bank_transfer' ? 'Chuyển khoản' : method === 'momo' ? 'MoMo' : 'VNPay'} />}
      </div>
      <a href="/customer/booking/dich_vu_luu_tru" className="mt-4 rounded-full bg-understory px-8 py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors">
        Về trang Dịch vụ lưu trú
      </a>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-wood-bark/60">{label}</span>
      <span className="font-semibold text-wood-bark">{value}</span>
    </div>
  );
}