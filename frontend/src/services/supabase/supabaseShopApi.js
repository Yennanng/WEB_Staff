import { supabase } from './client';

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  return data;
};

export const fetchProducts = async (filters = {}) => {
  // Lấy dữ liệu sản phẩm kèm theo variant và hình ảnh
  let query = supabase
    .from('product')
    .select(`
      product_id, 
      category_id, 
      brand, 
      name, 
      description, 
      is_active,
      category:category_id (category_name),
      product_variant (variant_id, sku, capacity_label, price, stock_quantity),
      product_image (image_url)
    `)
    .eq('is_active', true);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  // Chuyển đổi dữ liệu về dạng mà component đang sử dụng
  let result = data.map(p => {
    const variants = p.product_variant || [];
    const images = p.product_image || [];

    // Tìm giá thấp nhất để hiển thị làm giá đại diện
    const minPrice = variants.length > 0
      ? Math.min(...variants.map(v => Number(v.price)))
      : 0;

    // Tổng số lượng kho
    const totalStock = variants.reduce((sum, v) => sum + Number(v.stock_quantity), 0);

    return {
      id: p.product_id,
      name: p.name,
      brand: p.brand || 'Khác',
      category: p.category?.category_name || 'Khác',
      pet_type: 'Chó, Mèo', // Tạm thời hardcode do CSDL chưa có trường pet_type cho product
      price: minPrice,
      stock: totalStock,
      image: images.length > 0 ? images[0].image_url : 'https://placehold.co/400?text=No+Image',
      variants: variants.map(v => v.capacity_label),
      full_variants: variants
    };
  });

  // Áp dụng filters ở client (tương tự như cũ)
  if (filters.category && filters.category !== 'Tất cả') {
    result = result.filter(p => p.category === filters.category);
  }
  if (filters.pet_type && filters.pet_type !== 'Tất cả') {
    result = result.filter(p => p.pet_type.includes(filters.pet_type));
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
  }

  return result;
};

export const fetchProductById = async (product_id) => {
  let query = supabase
    .from('product')
    .select(`
      product_id, 
      category_id, 
      brand, 
      name, 
      description, 
      is_active,
      category:category_id (category_name),
      product_variant (variant_id, sku, capacity_label, price, stock_quantity),
      product_image (image_url)
    `)
    .eq('product_id', product_id)
    .single();

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching product by id:', error);
    throw error;
  }

  const variants = data.product_variant || [];
  const images = data.product_image || [];
  const minPrice = variants.length > 0
    ? Math.min(...variants.map(v => Number(v.price)))
    : 0;

  const totalStock = variants.reduce((sum, v) => sum + Number(v.stock_quantity), 0);

  return {
    id: data.product_id,
    name: data.name,
    brand: data.brand || 'Khác',
    category: data.category?.category_name || 'Khác',
    pet_type: 'Chó, Mèo', 
    price: minPrice,
    stock: totalStock,
    images: images.length > 0 ? images.map(img => img.image_url) : ['https://placehold.co/400?text=No+Image'],
    variants: variants.map(v => v.capacity_label),
    full_variants: variants,
    description: data.description
  };
};

// Cập nhật lại logic chọn Variant phù hợp nhất khi Add to Cart
export const getVariantDetails = (product, selectedVariantLabel) => {
  if (!product || !product.full_variants) return null;
  return product.full_variants.find(v => v.capacity_label === selectedVariantLabel) || product.full_variants[0];
};

export const createOrder = async (orderData) => {
  // Tạo ID ngẫu nhiên cho order (vd: ORD12345) - tối đa 8 ký tự
  const order_id = `ORD${Math.floor(10000 + Math.random() * 90000).toString()}`;

  // 1. Tạo bản ghi Order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        order_id: order_id,
        customer_id: orderData.customer_id,
        status: orderData.status || 'COMPLETED',
        subtotal: orderData.subtotal || orderData.total_amount, 
        total_amount: orderData.total_amount,
        shipping_fee: orderData.shipping_fee || 0,
        discount_amount: orderData.discount_amount || 0,
      }
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Tạo Order Items
  if (orderData.items && orderData.items.length > 0) {
    const orderItems = orderData.items.map(item => ({
      order_item_id: `ORI${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      order_id: order_id,
      variant_id: item.variant_id, // Cần variant_id thật
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_item')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Cập nhật trừ số lượng kho (Tùy chọn: Có thể viết thêm vòng lặp trừ kho ở đây)
  }

  // 3. Tạo Shipment (nếu giao hàng)
  if (orderData.shipping_info && orderData.shipping_info.street !== 'Tại quầy') {
    const { error: shipmentError } = await supabase
      .from('shipment')
      .insert([
        {
          shipment_id: `SHP${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          order_id: order_id,
          address_id: orderData.address_id,
          shipment_status: 'PENDING',
        }
      ]);

    if (shipmentError) console.error("Shipment error:", shipmentError);
  }

  return newOrder;
};

export const fetchOrders = async (filters = {}) => {
  // Lấy danh sách order kêt hợp order_item
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_item (
        quantity, unit_price, subtotal, variant_id,
        product_variant (capacity_label, product (name))
      ),
      customer (first_name, last_name, phone)
    `)
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  // Map dữ liệu về UI format
  return data.map(o => ({
    order_id: o.order_id,
    customer_name: o.customer ? `${o.customer.last_name} ${o.customer.first_name}` : 'Khách mua tại quầy',
    customer_phone: o.customer?.phone || '',
    status: o.status,
    total_amount: o.total_amount,
    created_at: new Date(o.created_at).toLocaleString('vi-VN'),
    shipping_info: {
      street: 'Tại quầy',
      ward: '',
      district: '',
      province: ''
    },
    items: (o.order_item || []).map(i => ({
      name: i.product_variant?.product?.name || 'Sản phẩm',
      variant: i.product_variant?.capacity_label || '',
      quantity: i.quantity,
      price: i.unit_price
    })),
    history: [] // Tạm thời rỗng
  }));
};

export const updateOrderStatus = async (order_id, newStatus) => {
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('order_id', order_id);

  if (error) throw error;
  return true;
};

// ── Cart API ─────────────────────────────────────────────────────────────────
// Các hàm thao tác với bảng cart_item (dùng cho CartContext khi user đăng nhập)

/**
 * Lấy toàn bộ giỏ hàng của customer từ DB, kèm thông tin sản phẩm.
 */
export async function fetchDbCart(customerId) {
  const { data, error } = await supabase
    .from('cart_item')
    .select(`
      cart_item_id,
      variant_id,
      quantity,
      product_variant (
        capacity_label,
        price,
        stock_quantity,
        product (name, brand, product_image (image_url))
      ),
      cart!inner(customer_id)
    `)
    .eq('cart.customer_id', customerId);

  if (error) {
    console.error('fetchDbCart error:', error);
    return [];
  }

  return (data || []).map((item) => {
    const variant = item.product_variant || {};
    const product = variant.product || {};
    const images = product.product_image || [];
    return {
      cart_item_id: item.cart_item_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      name: product.name || 'Sản phẩm',
      brand: product.brand || 'Khác',
      price: Number(variant.price) || 0,
      image: images[0]?.image_url || 'https://placehold.co/400?text=No+Image',
      capacity_label: variant.capacity_label || '',
      stock_quantity: Number(variant.stock_quantity) || 0,
    };
  });
}

/**
 * Thêm sản phẩm vào giỏ hàng DB.
 * Nếu variant đã có trong giỏ → tăng số lượng.
 */
export const addDbCartItem = async (customer_id, variant_id, quantity = 1) => {
  // 1. Lấy hoặc tạo cart cho customer
  let { data: cart } = await supabase
    .from('cart')
    .select('cart_id')
    .eq('customer_id', customer_id)
    .maybeSingle();

  if (!cart) {
    const cart_id = `CRT${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const { error: cartError } = await supabase
      .from('cart')
      .insert([{ cart_id, customer_id }]);
    if (cartError) throw cartError;
    cart = { cart_id };
  }
  const cart_id = cart.cart_id;

  // 2. Kiểm tra xem variant đã tồn tại trong cart_item chưa
  const { data: existing } = await supabase
    .from('cart_item')
    .select('cart_item_id, quantity')
    .eq('cart_id', cart_id)
    .eq('variant_id', variant_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_item')
      .update({ quantity: existing.quantity + quantity })
      .eq('cart_item_id', existing.cart_item_id);
    if (error) throw error;
  } else {
    const cart_item_id = `CIT${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const { error } = await supabase
      .from('cart_item')
      .insert([{ cart_item_id, cart_id, variant_id, quantity }]);
    if (error) throw error;
  }
};

/**
 * Cập nhật số lượng của 1 item trong giỏ hàng DB.
 */
export const updateDbCartItemQty = async (cart_item_id, quantity) => {
  const { error } = await supabase
    .from('cart_item')
    .update({ quantity })
    .eq('cart_item_id', cart_item_id);
  if (error) throw error;
};

/**
 * Xóa 1 item khỏi giỏ hàng DB.
 */
export const removeDbCartItem = async (cart_item_id) => {
  const { error } = await supabase
    .from('cart_item')
    .delete()
    .eq('cart_item_id', cart_item_id);
  if (error) throw error;
};

/**
 * Xóa toàn bộ giỏ hàng DB của customer.
 */
export const clearDbCartItems = async (customer_id) => {
  const { data: cart } = await supabase
    .from('cart')
    .select('cart_id')
    .eq('customer_id', customer_id)
    .maybeSingle();
  if (!cart) return;

  const { error } = await supabase
    .from('cart_item')
    .delete()
    .eq('cart_id', cart.cart_id);
  if (error) throw error;
};

/**
 * Xóa các items được chọn (theo variant_id) khỏi giỏ hàng DB.
 */
export const removeSelectedDbCartItems = async (customer_id, variantIds) => {
  if (!variantIds || variantIds.length === 0) return;
  
  const { data: cart } = await supabase
    .from('cart')
    .select('cart_id')
    .eq('customer_id', customer_id)
    .maybeSingle();
  if (!cart) return;

  const { error } = await supabase
    .from('cart_item')
    .delete()
    .eq('cart_id', cart.cart_id)
    .in('variant_id', variantIds);
  if (error) throw error;
};

export const getOrCreateGuestCustomer = async (data) => { return { customer_id: 'GST00001' }; };
export const createCustomerAddress = async (data) => { return { address_id: 'ADR00001' }; };
