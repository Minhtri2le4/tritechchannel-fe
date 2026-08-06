import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink, Clock, RefreshCw, Home, ChevronRight } from 'lucide-react';

const NEWS_SOURCES = [
  { id: 'vnexpress', name: 'VnExpress Công Nghệ', url: 'https://vnexpress.net/rss/so-hoa.rss' },
  { id: 'genk', name: 'GenK News', url: 'https://genk.vn/rss/tin-moi-nhat.rss' }
];

// Bộ 9 ảnh công nghệ chất lượng cao (9 chủ đề khác nhau 100%)
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop', // Smartphone
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop', // Setup PC/Gaming
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop', // Tech Work
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop', // Code / Software
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop', // AI Cyber
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop', // Laptop Modern
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop', // Gadget Hardware
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop', // Server Data
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop'  // Tablet / Apple
];

export default function TechNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState(NEWS_SOURCES[0].url);

  const fetchNews = async (rssUrl) => {
    setLoading(true);
    try {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&_t=${Date.now()}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status === 'ok') {
        // Lấy đúng 9 bài mới nhất
        setArticles((data.items || []).slice(0, 9));
      }
    } catch (error) {
      console.error("Lỗi khi lấy tin tức:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedSource);
  }, [selectedSource]);

  // Bóc tách URL ảnh
  const getArticleImage = (item, index) => {
    let img = '';
    
    if (item.thumbnail && typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http')) {
      img = item.thumbnail;
    } else if (item.enclosure && item.enclosure.link) {
      img = item.enclosure.link;
    } else if (item.description || item.content) {
      const htmlStr = item.content || item.description || '';
      const match = htmlStr.match(/src=["'](https?:\/\/[^"'\s]+)["']/i);
      if (match && match[1]) img = match[1];
    }

    // Nếu bóc tách thành công ảnh của báo -> trả về link ảnh
    if (img && !img.includes('rss2json')) return img;

    // Nếu không có ảnh -> Trả về ảnh fallback theo đúng STT index (0 -> 8)
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  // Làm sạch văn bản mô tả
  const cleanDescription = (htmlStr) => {
    if (!htmlStr) return 'Cập nhật tin tức công nghệ mới nhất hôm nay...';
    const text = htmlStr.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length > 110 ? text.substring(0, 110) + '...' : text;
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-16 text-gray-800 w-full">
      
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-3 py-2 text-xs text-gray-600 flex items-center gap-1">
        <Link to="/" className="hover:text-yellow-600 flex items-center gap-1">
          <Home size={12} /> Trang chủ
        </Link>
        <ChevronRight size={10} className="text-gray-400" />
        <span className="font-semibold text-gray-800">Tin Công Nghệ Mới Nhất</span>
      </div>

      {/* Header Banner Vàng Đen (#FFD400) */}
      <div className="max-w-6xl mx-auto px-3 my-1">
        <div className="w-full rounded-2xl bg-[#FFD400] p-5 sm:p-7 border border-yellow-500 shadow-sm text-center">
          <div className="inline-flex items-center gap-2 bg-black text-[#FFD400] font-extrabold text-xs px-3 py-1 rounded-full uppercase mb-2">
            <Newspaper size={14} /> LIVE NEWS FEED
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
            TIN TỨC CÔNG NGHỆ 24/7
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
            Tự động cập nhật liên tục từ các trang báo công nghệ hàng đầu
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 mt-4">
        
        {/* Bộ lọc Nguồn tin */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Nguồn tin:</span>
            {NEWS_SOURCES.map((src) => (
              <button
                key={src.id}
                onClick={() => setSelectedSource(src.url)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedSource === src.url
                    ? 'bg-black text-[#FFD400]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {src.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchNews(selectedSource)}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#FFD400] text-black border border-yellow-500 px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Cập nhật tin mới
          </button>
        </div>

        {/* Lưới 9 bài viết */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div key={n} className="bg-white rounded-xl p-3 border border-gray-200 animate-pulse h-72">
                <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((item, index) => {
              const articleImg = getArticleImage(item, index);

              return (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl border border-gray-200 hover:border-[#FFD400] shadow-sm hover:shadow-md transition-all duration-200 p-3 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="h-40 w-full rounded-lg overflow-hidden bg-gray-100 mb-3 relative">
                      <img
                        src={articleImg}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // 🔥 ĐẶC BIỆT FIX: Nếu ảnh báo bị chặn link -> Dùng ảnh ngẫu nhiên theo index riêng biệt!
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                        }}
                      />
                      <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Clock size={10} /> {new Date(item.pubDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {/* Tiêu đề & Nội dung */}
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-amber-600 line-clamp-2 leading-snug mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {cleanDescription(item.description)}
                    </p>
                  </div>

                  {/* Footer Card */}
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-medium">
                    <span className="text-amber-600 font-bold">Đọc bài gốc</span>
                    <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform text-amber-600" />
                  </div>
                </a>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}