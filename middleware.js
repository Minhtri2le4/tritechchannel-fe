// Vercel Routing Middleware – chạy trên máy chủ Vercel trước khi trả trang cho trình duyệt / Google / Facebook.
// Web là SPA: file index.html giống nhau cho mọi đường dẫn nên Google tưởng mọi trang sản phẩm là trang chủ
// (gom ảnh sản phẩm về trang chủ). Ở đây điền sẵn tiêu đề, mô tả, ảnh, link chuẩn (canonical) và giá
// riêng cho từng trang sản phẩm / bài blog ngay trong HTML. Lỗi gì thì bỏ qua, trả trang như cũ.
export const config = { matcher: ['/product/:path*', '/blog/:path+'] };

const SITE = 'https://www.tritechchannel.com';
const API_ORIGIN = 'https://api.tritechchannel.com';
const API = `${API_ORIGIN}/api/v1`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clip = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};
const abs = (src) => {
  if (!src) return `${SITE}/assets/logo.png`;
  if (/^https?:/.test(src)) return src;
  return `${src.startsWith('/uploads/') ? API_ORIGIN : SITE}${src}`;
};
const vnd = (n) => Number(n || 0).toLocaleString('vi-VN');
const cleanName = (name) => String(name || '').replace(/^\s*(\[[^\]]*\]\s*)+/, '').trim();

const productMeta = (p) => {
  const prices = [p.price, ...(p.variants || []).map((v) => v.price), ...(p.colors || []).map((c) => c.price)].filter((x) => x > 0);
  const price = prices.length ? Math.min(...prices) : p.price;
  const inStock = p.stock > 0 || (p.variants || []).some((v) => v.stock > 0) || (p.colors || []).some((c) => c.stock > 0);
  const path = `/product/${p.slug || p.id}`;
  const images = [p.image, ...(p.images || [])].filter(Boolean).map(abs);
  return {
    title: `${p.name} - Giá ${vnd(price)}đ | TriTech Channel`,
    description: clip(
      p.description ||
        `Mua ${cleanName(p.name)}${p.brand ? ` chính hãng ${p.brand}` : ''} giá ${vnd(price)}đ tại TriTech Channel. Giao hàng toàn quốc, bảo hành 1 đổi 1.`,
      160
    ),
    image: images[0] || abs(),
    url: `${SITE}${path}`,
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      image: images,
      description: clip(p.description || p.name, 500),
      sku: String(p.id),
      ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
      offers: {
        '@type': 'Offer',
        url: `${SITE}${path}`,
        priceCurrency: 'VND',
        price,
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'TriTech Channel' },
      },
    },
  };
};

const postMeta = (p) => {
  const images = (Array.isArray(p.images) ? p.images : []).map(abs);
  return {
    title: `${p.title} | TriTech Channel`,
    description: clip(p.content || p.title, 160),
    image: images[0] || abs(),
    url: `${SITE}/blog/${p.slug}`,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      image: images,
      author: { '@type': 'Organization', name: 'TriTech Channel' },
      mainEntityOfPage: `${SITE}/blog/${p.slug}`,
    },
  };
};

// Thay thẻ trong <head> của index.html bằng thông tin riêng của trang
export const injectMeta = (html, m) => {
  const tags = [
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${esc(m.url)}" />`,
    `<meta property="og:type" content="${m.type}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    `<meta property="og:url" content="${esc(m.url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    // id trùng với useSeo để trang chạy lên chỉ thay nội dung, không bị 2 bản
    `<script type="application/ld+json" id="seo-jsonld">${JSON.stringify(m.jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace(/\s*<meta property="og:(type|title|description|image|url)"[^>]*>/g, '')
    .replace('</head>', `    ${tags}\n  </head>`);
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2) return undefined; // không phải /product/<slug> hoặc /blog/<slug>
  const [kind, slug] = parts;
  try {
    const [htmlRes, dataRes] = await Promise.all([
      fetch(new URL('/index.html', url)),
      fetch(`${API}/${kind === 'product' ? 'products' : 'posts'}/${encodeURIComponent(slug)}`, { headers: { accept: 'application/json' } }),
    ]);
    if (!htmlRes.ok || !dataRes.ok) return undefined;
    const { data } = await dataRes.json();
    if (!data) return undefined;
    const meta = kind === 'product' ? productMeta(data) : postMeta(data);
    const html = injectMeta(await htmlRes.text(), meta);
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return undefined; // lỗi mạng / API -> trả trang SPA bình thường
  }
}
