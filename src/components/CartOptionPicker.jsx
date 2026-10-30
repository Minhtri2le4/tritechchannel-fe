import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { shopApi } from '../services/shop';
import { assetUrl } from '../lib/api';
import VariantSheet from './VariantSheet';

// Đổi phân loại / phiên bản của 1 món ngay trong giỏ hàng (như Shopee).
// Tải lại sản phẩm để có danh sách phiên bản, giá và kho mới nhất.
export default function CartOptionPicker({ item, onConfirm, onClose }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [variantId, setVariantId] = useState(item.variantId);
  const [color, setColor] = useState(item.color || '');
  const [qty, setQty] = useState(item.quantity);

  useEffect(() => {
    shopApi
      .product(item.productId)
      .then(({ data }) => {
        // Admin sửa sản phẩm thì mã phiên bản đổi -> khớp lại theo tên phiên bản
        const label = item.variantLabel || item.name.match(/\(([^)]+)\)$/)?.[1];
        const v = (data.variants || []).find((x) => x.id === item.variantId) || (data.variants || []).find((x) => x.label === label);
        setVariantId(v?.id ?? null);
        setProduct(data);
      })
      .catch((err) => setError(err.status === 404 ? 'Sản phẩm đã ngừng bán' : err.message));
  }, [item.productId, item.variantId, item.variantLabel, item.name]);

  if (!product) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
          {error || (
            <>
              <Loader2 size={16} className="animate-spin" /> Đang tải phân loại…
            </>
          )}
        </div>
      </div>
    );
  }

  const variants = product.variants || [];
  const colors = product.colors || [];
  const variant = variants.find((v) => v.id === variantId) || null;
  const price = variant?.price ?? product.price;
  const originalPrice = variant ? variant.originalPrice : product.originalPrice;
  const stock = variant ? variant.stock : product.stock;
  const colorImage = colors.find((c) => c.name === color)?.image;
  const missing = [colors.length && !color && 'Phân loại', variants.length && !variant && 'Phiên bản'].filter(Boolean).join(' và ');

  return (
    <VariantSheet
      mode="cart"
      confirmLabel="Xác nhận"
      image={assetUrl(colorImage || product.image)}
      priceText={`${price.toLocaleString('vi-VN')}₫`}
      originalPrice={originalPrice > price ? originalPrice : null}
      stockText={stock > 0 ? `Kho: ${stock}` : 'Tạm hết hàng'}
      variants={variants}
      colors={colors.map((c) => ({ ...c, imageUrl: c.image ? assetUrl(c.image) : null }))}
      variantId={variantId}
      onVariant={setVariantId}
      color={color}
      onColor={(c) => setColor(c.name)}
      qty={Math.min(qty, Math.max(1, stock || 1))}
      maxQty={Math.max(1, Math.min(stock || 1, 99))}
      onQty={setQty}
      missing={missing}
      onConfirm={() => {
        if (stock <= 0) return alert('Lựa chọn này tạm hết hàng, vui lòng chọn phân loại khác');
        onConfirm(product, color, variant, Math.min(qty, Math.max(1, stock)));
      }}
      onClose={onClose}
    />
  );
}
