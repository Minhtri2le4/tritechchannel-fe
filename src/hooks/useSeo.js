import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Thông tin SEO cho từng trang: tiêu đề tab, mô tả hiện trên Google, ảnh khi chia sẻ Facebook/Zalo,
// link chuẩn (canonical) và dữ liệu có cấu trúc (JSON-LD) để Google hiện giá, còn hàng...
export const SITE_URL = 'https://www.tritechchannel.com';
export const SITE_NAME = 'TriTech Channel';
const DEFAULT_TITLE = 'TriTech Channel - Điện Thoại & Phụ Kiện Công Nghệ Chính Hãng';
const DEFAULT_DESCRIPTION =
  'TriTech Channel - shop online điện thoại, sạc dự phòng, củ sạc, tai nghe, phụ kiện công nghệ chính hãng. Giao hàng toàn quốc, bảo hành 1 đổi 1, nhận trực tiếp tại Thanh Đa, Bình Thạnh, TP.HCM.';
const DEFAULT_IMAGE = `${SITE_URL}/assets/logo.png`;

// Tạo hoặc cập nhật thẻ <meta>/<link> trong <head>
function setTag(tag, keyAttr, key, valueAttr, value) {
  let el = document.head.querySelector(`${tag}[${keyAttr}="${key}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(keyAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(valueAttr, value);
}

const clip = (text, max) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

/**
 * @param {object} seo
 * @param {string} [seo.title]        Tiêu đề trang (tự thêm " | TriTech Channel")
 * @param {string} [seo.description]  Mô tả ~150 ký tự
 * @param {string} [seo.image]        Ảnh đại diện (URL tuyệt đối)
 * @param {string} [seo.path]         Đường dẫn chuẩn, mặc định là đường dẫn hiện tại
 * @param {object|object[]} [seo.jsonLd] Dữ liệu có cấu trúc schema.org
 * @param {boolean} [seo.noindex]     Không cho Google lập chỉ mục (giỏ hàng, 404...)
 */
export default function useSeo({ title, description, image, path, jsonLd, noindex } = {}) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = clip(description || DEFAULT_DESCRIPTION, 160);
  const url = `${SITE_URL}${path ?? pathname}`;
  const img = image || DEFAULT_IMAGE;
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = fullTitle;
    setTag('meta', 'name', 'description', 'content', desc);
    setTag('meta', 'name', 'robots', 'content', noindex ? 'noindex, follow' : 'index, follow');
    setTag('link', 'rel', 'canonical', 'href', url);
    setTag('meta', 'property', 'og:title', 'content', fullTitle);
    setTag('meta', 'property', 'og:description', 'content', desc);
    setTag('meta', 'property', 'og:url', 'content', url);
    setTag('meta', 'property', 'og:image', 'content', img);

    let script = document.getElementById('seo-jsonld');
    if (ld) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'seo-jsonld';
        document.head.appendChild(script);
      }
      script.textContent = ld;
    } else if (script) {
      script.remove();
    }
  }, [fullTitle, desc, url, img, ld, noindex]);
}
