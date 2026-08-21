import { useState, useRef, useEffect } from 'react';
import { MapPin, Mail, Bot, X, Send, PhoneCall } from 'lucide-react';

export default function Footer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);

  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Xin chào! Trợ lý AI Tritech có thể giúp gì cho bạn hôm nay?' }
  ]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (customText) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    // Thêm tin nhắn của User
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    if (!customText) setChatInput('');
    setIsTyping(true);

    // AI trả lời giả lập
    setTimeout(() => {
      let aiReply = "Cảm ơn bạn đã liên hệ TriTech! Sản phẩm hiện đang có sẵn hàng chính hãng, hỗ trợ giao nhanh và bảo hành đầy đủ ạ.";
      if (textToSend.toLowerCase().includes("chính hãng")) {
        aiReply = "Tất cả sản phẩm tại TriTech Channel đều là hàng chính hãng 100%, có đầy đủ hóa đơn VAT và bảo hành chính hãng.";
      } else if (textToSend.toLowerCase().includes("giao hàng")) {
        aiReply = "TriTech hỗ trợ giao hàng hoả tốc trong 2h tại TP.HCM và ship COD toàn quốc từ 1-3 ngày!";
      } else if (textToSend.toLowerCase().includes("bảo hành")) {
        aiReply = "Dịch vụ bảo hành 1 đổi 1 trong vòng 45 ngày nếu có lỗi từ nhà sản xuất bạn nhé.";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* FOOTER NỀN SÁNG CHUẨN THƯƠNG MẠI ĐIỆN TỬ */}
      <footer className="bg-[#FAFAFA] border-t border-gray-200 text-gray-600 pt-16 pb-8 text-sm mt-10">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          
          <div className="lg:col-span-2">
            <h4 className="font-black text-gray-900 text-xl uppercase mb-4 tracking-tight flex items-center gap-2">
              Tritech Channel
            </h4>
            <p className="font-medium mb-2 flex items-start gap-2">
              <MapPin size={16} className="text-red-600 shrink-0 mt-0.5" /> 
              <span>Lô 7 Cư Xá Thanh Đa, Bình Thạnh, TP. Hồ Chí Minh</span>
            </p>
            <p className="font-medium mb-4 flex items-center gap-2">
              <Mail size={16} className="text-red-600 shrink-0" /> 
              tricuc77@gmail.com
            </p>
            <div className="w-full h-[180px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.9043442056227!2d106.71602427575296!3d10.818631989332712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175289126aaaaab%3A0xbf99862f617dcd30!2sCong%20Doan%20Thanh%20Da%20Hotel!5e0!3m2!1svi!2s!4v1786079182047!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm border-b border-gray-200 pb-2 inline-block">Hỗ trợ khách hàng</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#" className="hover:text-red-600 hover:translate-x-2 inline-block transition-all duration-300">Chính sách chung</a></li>
              <li><a href="#" className="hover:text-red-600 hover:translate-x-2 inline-block transition-all duration-300">Bảo hành 1 đổi 1</a></li>
              <li><a href="#" className="hover:text-red-600 hover:translate-x-2 inline-block transition-all duration-300">Giao hàng và kiểm tra</a></li>
              <li><a href="#" className="hover:text-red-600 hover:translate-x-2 inline-block transition-all duration-300">Trả hàng hoàn tiền</a></li>
              <li><a href="#" className="hover:text-red-600 hover:translate-x-2 inline-block transition-all duration-300">Bảo mật thông tin</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm border-b border-gray-200 pb-2 inline-block">Thanh toán & CSKH</h4>
            <div className="mb-6">
              <p>Hotline hỗ trợ 24/7:</p>
              <p className="text-xl font-black text-amber-500 mt-1 hover:text-amber-600 transition-colors cursor-pointer">0325.477.841</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-[8px] text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">VISA</div>
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-[8px] text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">ATM</div>
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-[8px] text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">JCB</div>
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-[8px] text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">COD</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm border-b border-gray-200 pb-2 inline-block">Kết nối với chúng tôi</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#1877F2] transition-all duration-300 group">
                <svg className="w-5 h-5 fill-gray-500 group-hover:fill-[#1877F2] transition-colors" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Facebook</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#000000] transition-all duration-300 group">
                <svg className="w-5 h-5 fill-gray-500 group-hover:fill-[#000000] transition-colors" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors">TikTok</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#EE4D2D] transition-all duration-300 group">
                <svg className="w-5 h-5 fill-gray-500 group-hover:fill-[#EE4D2D] transition-colors" viewBox="0 0 24 24"><path d="M16.2 6.1l-4.2-4.5c-.1-.1-.3-.2-.5-.2s-.4.1-.5.2l-4.2 4.5c-.3.3-.3.8 0 1.1s.8.3 1.1 0l3.6-3.8v10.5c0 .4.3.7.7.7s.7-.3.7-.7V3.4l3.6 3.8c.1.1.3.2.5.2s.4-.1.5-.2c.3-.3.3-.8 0-1.1zM5.5 13.5c-.4 0-.7.3-.7.7v4.5c0 .4.3.7.7.7h13c.4 0 .7-.3.7-.7v-4.5c0-.4-.3-.7-.7-.7s-.7.3-.7.7v3.8h-11.6v-3.8c0-.4-.3-.7-.7-.7z"/></svg>
                <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Shopee</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#FF0000] transition-all duration-300 group">
                <svg className="w-5 h-5 fill-gray-500 group-hover:fill-[#FF0000] transition-colors" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors">YouTube</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 border-t border-gray-200 pt-6 text-center text-[11px] text-gray-500 leading-relaxed">
          <p>Công ty TNHH Tritech Channel - GPĐKKD 0109597994 tại Sở Kế Hoạch Đầu Tư Thành Phố HCM ngày 15-4-2021.</p>
          <p className="mt-1">Địa chỉ: Lô 7 Cư Xá Thanh Đa, Bình Thạnh, TP. Hồ Chí Minh - Điện thoại: 0325.477.841 - Chịu trách nhiệm quản lý nội dung: Hồ Minh Trí</p>
          <p className="mt-3 font-bold text-gray-600">Copyright © 2026 Tritech Channel</p>
        </div>
      </footer>

      {/* KHUNG CHAT AI CỐ ĐỊNH CHIỀU CAO */}
      {isChatOpen && (
        <div className="fixed bottom-[90px] right-4 w-[340px] h-[450px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 z-[60] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Chat Header */}
          <div className="bg-gray-900 p-3.5 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full"><Bot size={18} className="text-white" /></div>
              <div>
                <h4 className="font-bold text-[13px] leading-tight">Trợ lý AI Tritech</h4>
                <p className="text-[10px] text-gray-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Đang hoạt động
                </p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-white cursor-pointer border border-transparent hover:border-gray-500">
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-3 bg-gray-50 flex flex-col gap-3 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-2.5 rounded-2xl text-[13px] shadow-sm ${msg.sender === 'ai' ? 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-none' : 'bg-red-600 text-white self-end rounded-tr-none'}`}>
                {msg.text}
              </div>
            ))}
            
            {/* Hiệu ứng AI đang gõ */}
            {isTyping && (
              <div className="max-w-[85%] p-3 rounded-2xl shadow-sm bg-white border border-gray-200 text-gray-800 self-start rounded-tl-none flex items-center gap-1.5 w-[60px] h-[36px]">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>

          {/* Chat Quick Replies */}
          <div className="px-3 py-2 bg-gray-50 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-200 shrink-0">
            <button 
              onClick={() => handleSendMessage("Hàng chính hãng không?")} 
              className="whitespace-nowrap text-[11px] font-medium bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              Hàng chính hãng không?
            </button>
            <button 
              onClick={() => handleSendMessage("Giao hàng bao lâu?")} 
              className="whitespace-nowrap text-[11px] font-medium bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              Giao hàng bao lâu?
            </button>
            <button 
              onClick={() => handleSendMessage("Bảo hành thế nào?")} 
              className="whitespace-nowrap text-[11px] font-medium bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              Bảo hành thế nào?
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 items-center shrink-0">
            <input 
              type="text" 
              placeholder="Nhập câu hỏi..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-[13px] bg-gray-100 border-transparent rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-gray-800"
            />
            <button 
              onClick={() => handleSendMessage()} 
              className="bg-red-600 text-white p-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-md flex-shrink-0 disabled:opacity-50"
              disabled={!chatInput.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* WIDGET LIÊN HỆ NỔI */}
      <div className="fixed bottom-4 right-4 z-50 group">
        <div className="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 group/ai cursor-pointer">
            <span className="bg-black/80 text-white text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              Hỏi Trợ lý AI Tritech
            </span>
            <div className="w-11 h-11 md:w-12 md:h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white">
              <Bot className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
          </button>
          <a href="https://zalo.me/0824654321" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/zalo cursor-pointer">
            <span className="bg-black/80 text-white text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/zalo:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              Chat Zalo NV Tư Vấn
            </span>
            <div className="w-11 h-11 md:w-12 md:h-12 bg-[#0068FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white">
              <span className="text-white font-black text-[10px] md:text-xs tracking-wider">Zalo</span>
            </div>
          </a>
        </div>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-[10px] md:text-xs px-4 py-2.5 md:px-5 md:py-3.5 rounded-full shadow-lg flex items-center gap-2 border-2 border-white transform hover:scale-105 transition-transform z-10 relative">
          <PhoneCall size={16} className="animate-pulse" /> LIÊN HỆ
        </button>
      </div>
    </>
  );
}