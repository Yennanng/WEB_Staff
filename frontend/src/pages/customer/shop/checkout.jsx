import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { createOrder, createCustomerAddress, getOrCreateGuestCustomer } from '@/services/supabase/supabaseShopApi';
import { fetchCustomerAddresses } from '@/services/supabase/supabaseUsersApi';
import {
  MapPin, CreditCard, Truck, ChevronRight, CheckCircle2,
  ShieldCheck, Clock, Package
} from 'lucide-react';
import { toast } from 'sonner';

const formatVND = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val ?? 0);

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, user, clearSelectedItems } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);

  // customer_address fields
  const [address, setAddress] = useState({
    recipient_name: '',
    recipient_phone: '',
    street_address: '',
    ward: '',
    district: '',
    province: '',
    delivery_note: '',
  });
  const [email, setEmail] = useState('');

  // Saved Addresses Book states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  // order_payment.payment_method (COD | MOMO | ZALOPAY)
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [onlineGateway, setOnlineGateway] = useState('MOMO');

  // orders.voucher_id
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const shippingFee = 25000;

  // Lấy items từ query hoặc toàn bộ giỏ
  useEffect(() => {
    if (router.query.ids) {
      const ids = Array.isArray(router.query.ids)
        ? router.query.ids
        : router.query.ids.split(',');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItems(cartItems.filter((i) => ids.includes(i.variant_id)));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItems(cartItems);
    }
  }, [cartItems, router.query.ids]);

  // Điền sẵn nếu đăng nhập & tải sổ địa chỉ
  useEffect(() => {
    if (user) {
      const loadAddresses = async () => {
        try {
          const list = await fetchCustomerAddresses(user.customer_id);
          setSavedAddresses(list);
          if (list.length > 0) {
            // Chọn địa chỉ mặc định hoặc địa chỉ đầu tiên
            const defaultAddr = list.find(a => a.is_default) || list[0];
            setSelectedAddressId(defaultAddr.address_id);
            setAddress({
              recipient_name: defaultAddr.recipient_name || '',
              recipient_phone: user.phone || defaultAddr.recipient_phone || '',
              street_address: defaultAddr.street_address || '',
              ward: defaultAddr.ward || '',
              district: defaultAddr.district || '',
              province: defaultAddr.province || '',
              delivery_note: defaultAddr.delivery_note || '',
            });
          } else {
            setSelectedAddressId('new');
            setAddress((prev) => ({
              ...prev,
              recipient_name: `${user.last_name ?? ''} ${user.first_name ?? ''}`.trim(),
              recipient_phone: user.phone ?? '',
            }));
          }
        } catch (err) {
          console.error('Failed to load saved addresses', err);
        }
      };
      loadAddresses();
      setEmail(user.email ?? '');
    } else {
      setSavedAddresses([]);
      setSelectedAddressId('new');
    }
  }, [user]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0
  );
  const grandTotal = subtotal + shippingFee - discountAmount;

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    try {
      const { supabase } = await import('@/services/supabase/client');
      const { data, error } = await supabase
        .from('voucher')
        .select('*')
        .eq('code', voucherCode.trim().toUpperCase())
        .eq('applicable_for', 'Shop')
        .maybeSingle();
      if (error || !data) {
        toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        return;
      }
      let discount = 0;
      if (data.discount_type === 'Phan_tram') {
        discount = (subtotal * data.discount_value) / 100;
        if (data.max_discount_amount) discount = Math.min(discount, data.max_discount_amount);
      } else {
        discount = data.discount_value ?? 0;
      }
      discount = Math.min(discount, subtotal);
      setAppliedVoucher(data);
      setDiscountAmount(discount);
      toast.success(`Áp dụng voucher thành công! Giảm ${formatVND(discount)}`);
    } catch {
      toast.error('Không thể kiểm tra mã giảm giá.');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Giỏ hàng trống, vui lòng chọn sản phẩm.');
      return;
    }
    if (!address.recipient_name || !address.recipient_phone || !address.street_address ||
        !address.ward || !address.district || !address.province) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }
    setSubmitting(true);
    try {
      let finalCustomerId = user?.customer_id ?? null;
      let finalAddressId = null;

      if (!finalCustomerId) {
        const result = await getOrCreateGuestCustomer({
          fullName: address.recipient_name,
          phone: address.recipient_phone,
          email,
          street: address.street_address,
          ward: address.ward,
          district: address.district,
          province: address.province,
          deliveryNote: address.delivery_note,
        });
        finalCustomerId = result?.customer_id ?? result?.customerId ?? result;
        finalAddressId = result?.address_id ?? result?.addressId ?? null;
      }

      if (finalCustomerId && !finalAddressId) {
        if (selectedAddressId !== 'new') {
          finalAddressId = selectedAddressId;
        } else {
          const addressResult = await createCustomerAddress({
            customer_id: finalCustomerId,
            recipient_name: address.recipient_name,
            recipient_phone: address.recipient_phone,
            street_address: address.street_address,
            ward: address.ward,
            district: address.district,
            province: address.province,
            delivery_note: address.delivery_note,
            is_default: savedAddresses.length === 0,
          });
          finalAddressId = addressResult?.address_id ?? null;
        }
      }

      const actualPaymentMethod = paymentMethod === 'ONLINE' ? onlineGateway : 'COD';
      const computedStatus = actualPaymentMethod === 'COD'
        ? grandTotal >= 1000000 ? 'pending_verification' : 'confirmed'
        : 'pending_payment';

      const orderData = {
        customer_id: finalCustomerId,
        address_id: finalAddressId,
        voucher_id: appliedVoucher?.voucher_id ?? null,
        payment_method: actualPaymentMethod,
        payment_status: 'pending',
        subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total_amount: grandTotal,
        status: computedStatus,
        items: selectedItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_info: {
          street: address.street_address,
          ward: address.ward,
          district: address.district,
          province: address.province,
        },
      };

      const result = await createOrder(orderData);
      setCreatedOrderId(result?.order_id ?? '');
      setSuccess(true);
      await clearSelectedItems(selectedItems.map((item) => item.variant_id));
      toast.success('Đặt hàng thành công!');
    } catch (err) {
      console.error('Lỗi đặt hàng:', err);
      toast.error(err?.message ?? 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <Header activePath="/customer/shop/checkout" />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-[#1B693C] transition-colors">Trang chủ</Link>
          <ChevronRight size={13} />
          <Link href="/san_pham" className="hover:text-[#1B693C] transition-colors">Cửa hàng</Link>
          <ChevronRight size={13} />
          <Link href="/customer/shop/cart" className="hover:text-[#1B693C] transition-colors">Giỏ hàng</Link>
          <ChevronRight size={13} />
          <span className="text-[#1B693C] font-bold">Thanh toán</span>
        </nav>

        {/* Màn hình thành công */}
        {success ? (
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg p-10 text-center space-y-5">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} className="text-[#1B693C]" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-[#362F22]">Đặt hàng thành công!</h2>
            <p className="text-sm text-gray-500">
              Mã đơn hàng:{' '}
              <span className="font-bold text-[#1B693C]">{createdOrderId}</span>
            </p>
            <p className="text-sm text-gray-500">
              Chúng tôi sẽ liên hệ xác nhận đơn trong thời gian sớm nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => router.push('/san_pham')}
                className="px-6 py-2.5 bg-[#1B693C] hover:bg-[#155230] text-white font-bold text-sm rounded-full transition-all cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-full transition-all cursor-pointer"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

              {/* ═══ CỘT TRÁI ═══ */}
              <div className="space-y-6">

                {/* Block: Thông tin giao hàng (customer_address) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <MapPin size={18} className="text-[#1B693C]" />
                    <h2 className="font-bold text-[#362F22] text-base">Thông tin giao hàng</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Saved Addresses List */}
                    {savedAddresses.length > 0 && (
                      <div className="mb-6 pb-6 border-b border-gray-100 space-y-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Địa chỉ đã lưu của bạn
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {savedAddresses.map((addr) => (
                            <label
                              key={addr.address_id}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedAddressId === addr.address_id
                                  ? 'border-[#1B693C] bg-[#f0f9f4]'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="selectedAddress"
                                value={addr.address_id}
                                checked={selectedAddressId === addr.address_id}
                                onChange={() => {
                                  setSelectedAddressId(addr.address_id);
                                  setAddress({
                                    recipient_name: addr.recipient_name || '',
                                    recipient_phone: user?.phone || addr.recipient_phone || '',
                                    street_address: addr.street_address || '',
                                    ward: addr.ward || '',
                                    district: addr.district || '',
                                    province: addr.province || '',
                                    delivery_note: addr.delivery_note || '',
                                  });
                                }}
                                className="mt-1 accent-[#1B693C]"
                              />
                              <div className="text-xs">
                                <p className="font-bold text-[#362F22]">
                                  {addr.recipient_name} — {user?.phone || addr.recipient_phone}
                                </p>
                                <p className="text-gray-500 mt-0.5 leading-relaxed">
                                  {addr.street_address}, {addr.ward}, {addr.district}, {addr.province}
                                </p>
                                {addr.is_default && (
                                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-green-50 text-[#1B693C] font-bold rounded text-[9px] uppercase tracking-wider">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                          
                          {/* New Address option */}
                          <label
                            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddressId === 'new'
                                ? 'border-[#1B693C] bg-[#f0f9f4]'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedAddress"
                              value="new"
                              checked={selectedAddressId === 'new'}
                              onChange={() => {
                                setSelectedAddressId('new');
                                setAddress({
                                  recipient_name: `${user?.last_name ?? ''} ${user?.first_name ?? ''}`.trim(),
                                  recipient_phone: user?.phone ?? '',
                                  street_address: '',
                                  ward: '',
                                  district: '',
                                  province: '',
                                  delivery_note: '',
                                });
                              }}
                              className="accent-[#1B693C]"
                            />
                            <span className="text-xs font-bold text-[#362F22]">Sử dụng địa chỉ giao hàng khác</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* recipient_name + recipient_phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Họ tên người nhận <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" required
                          value={address.recipient_name}
                          onChange={(e) => setAddress({ ...address, recipient_name: e.target.value })}
                          disabled={selectedAddressId !== 'new'}
                          placeholder="Nguyễn Văn A"
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all ${
                            selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel" required
                          value={address.recipient_phone}
                          onChange={(e) => setAddress({ ...address, recipient_phone: e.target.value })}
                          disabled={selectedAddressId !== 'new'}
                          placeholder="09xxxxxxxx"
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all ${
                            selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email (customer.email) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Email (tuỳ chọn)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all"
                      />
                    </div>

                    {/* province + district + ward */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Tỉnh / Thành phố <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" required
                          value={address.province}
                          onChange={(e) => setAddress({ ...address, province: e.target.value })}
                          disabled={selectedAddressId !== 'new'}
                          placeholder="Hà Nội"
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all ${
                            selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Quận / Huyện <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" required
                          value={address.district}
                          onChange={(e) => setAddress({ ...address, district: e.target.value })}
                          disabled={selectedAddressId !== 'new'}
                          placeholder="Cầu Giấy"
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all ${
                            selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Phường / Xã <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" required
                          value={address.ward}
                          onChange={(e) => setAddress({ ...address, ward: e.target.value })}
                          disabled={selectedAddressId !== 'new'}
                          placeholder="Dịch Vọng"
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all ${
                            selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* street_address */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Số nhà, tên đường <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text" required
                        value={address.street_address}
                        onChange={(e) => setAddress({ ...address, street_address: e.target.value })}
                        disabled={selectedAddressId !== 'new'}
                        placeholder="Số 10, ngõ 20 Cầu Giấy"
                        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all ${
                          selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>

                    {/* delivery_note */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Ghi chú giao hàng (tuỳ chọn)</label>
                      <textarea
                        rows={2}
                        value={address.delivery_note}
                        onChange={(e) => setAddress({ ...address, delivery_note: e.target.value })}
                        disabled={selectedAddressId !== 'new'}
                        placeholder="Giao giờ hành chính, gọi trước khi giao..."
                        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#1B693C] transition-all resize-none ${
                          selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Block: Phương thức thanh toán (order_payment.payment_method) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#1B693C]" />
                    <h2 className="font-bold text-[#362F22] text-base">Phương thức thanh toán</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    {/* Thanh toán Online */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'ONLINE' ? 'border-[#1B693C] bg-[#f0f9f4]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio" name="payment" value="ONLINE"
                        checked={paymentMethod === 'ONLINE'}
                        onChange={() => setPaymentMethod('ONLINE')}
                        className="mt-0.5 accent-[#1B693C]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-800">Thanh toán Online</span>
                          <div className="flex gap-1.5">
                            <span className="px-2 py-0.5 bg-[#ae2070] text-white text-[10px] font-bold rounded">MOMO</span>
                            <span className="px-2 py-0.5 bg-[#0068ff] text-white text-[10px] font-bold rounded">ZaloPay</span>
                          </div>
                        </div>
                        {paymentMethod === 'ONLINE' && (
                          <div className="mt-3 flex gap-3">
                            {[
                              { id: 'MOMO', label: 'MoMo', bg: 'bg-[#ae2070]' },
                              { id: 'ZALOPAY', label: 'ZaloPay', bg: 'bg-[#0068ff]' },
                            ].map((gw) => (
                              <button
                                key={gw.id} type="button"
                                onClick={() => setOnlineGateway(gw.id)}
                                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                                  onlineGateway === gw.id
                                    ? `border-[#1B693C] ${gw.bg} text-white`
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                {gw.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {paymentMethod === 'ONLINE' && (
                          <p className="mt-2 text-[11px] text-amber-600 flex items-center gap-1">
                            <Clock size={11} /> Sản phẩm được giữ 15 phút để hoàn tất thanh toán.
                          </p>
                        )}
                      </div>
                    </label>

                    {/* COD */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'COD' ? 'border-[#1B693C] bg-[#f0f9f4]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio" name="payment" value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-[#1B693C]"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                          <p className="text-xs text-gray-400 mt-0.5">Trả tiền mặt khi nhận được hàng</p>
                        </div>
                        <Truck size={20} className="text-gray-400" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ═══ CỘT PHẢI ═══ */}
              <div className="space-y-5 lg:sticky lg:top-6">

                {/* Danh sách sản phẩm (order_item) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Package size={16} className="text-[#1B693C]" />
                    <h3 className="font-bold text-[#362F22] text-sm">Đơn hàng của bạn</h3>
                    <span className="ml-auto text-xs text-gray-400">{selectedItems.length} sản phẩm</span>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {selectedItems.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-8">Chưa có sản phẩm nào.</p>
                    ) : (
                      selectedItems.map((item) => (
                        <div key={item.variant_id} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#362F22] truncate">{item.name}</p>
                            <p className="text-[11px] text-gray-400">
                              {item.capacity_label ?? ''} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-[#1B693C]">
                              {formatVND((item.price ?? 0) * (item.quantity ?? 1))}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mã giảm giá (orders.voucher_id) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mã giảm giá</p>
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                      <span className="text-sm font-bold text-[#1B693C]">{appliedVoucher.code}</span>
                      <button
                        type="button" onClick={handleRemoveVoucher}
                        className="text-xs text-red-400 hover:text-red-600 font-semibold ml-3 cursor-pointer"
                      >
                        Xoá
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã voucher..."
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:border-[#1B693C]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        className="px-4 py-2 bg-[#1B693C] hover:bg-[#155230] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}
                </div>

                {/* Tóm tắt giá (orders: subtotal, shipping_fee, discount_amount, total_amount) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold">{formatVND(shippingFee)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">- {formatVND(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-[#362F22]">Tổng cộng</span>
                    <span className="text-xl font-black text-[#1B693C]">{formatVND(grandTotal)}</span>
                  </div>
                </div>

                {/* Nút đặt hàng */}
                <button
                  type="submit"
                  disabled={submitting || selectedItems.length === 0}
                  className="w-full py-4 bg-[#1B693C] hover:bg-[#155230] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#1B693C]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Đang đặt hàng...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Xác nhận đặt hàng — {formatVND(grandTotal)}
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={11} /> Thông tin được mã hoá và bảo mật an toàn
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
