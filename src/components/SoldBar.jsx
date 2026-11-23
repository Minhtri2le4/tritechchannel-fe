// Thanh "Đang bán chạy / Đã bán N" kiểu Flash Sale Shopee: nền cam nhạt, phần đã bán tô đỏ-cam,
// bán được kha khá thì có ngọn lửa ở đầu thanh.
const short = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}K` : n);

export default function SoldBar({ sold = 0, stock = 0, className = '' }) {
  const hot = sold >= 10;
  // Phần trăm đã bán so với (đã bán + còn lại); tối thiểu 12% để thanh luôn có màu
  const pct = sold > 0 ? Math.min(100, Math.max(12, Math.round((sold / (sold + Math.max(stock, 0) || 1)) * 100))) : 12;
  return (
    <div className={`relative h-4 md:h-[18px] w-full ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-full" style={{ background: '#FFBDA6' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(270deg, #FFB000 0%, #EB1717 100%)' }} />
      </div>
      {hot && (
        <svg viewBox="0 0 24 30" aria-hidden="true" className="absolute -left-0.5 bottom-0 h-[22px] md:h-6 w-auto drop-shadow-sm">
          <path fill="#EE4D2D" d="M12 0c1 5 6 8 8 13 3 7-2 17-8 17S1 25 2 18c1-4 4-6 4-10 3 2 4 5 4 7 2-4 3-9 2-15z" />
          <path fill="#FFB000" d="M12 13c0 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1 1 2 2 2 0-2-1-4 0-7z" />
        </svg>
      )}
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-white"
        style={{ textShadow: '0 1px 1px rgba(0,0,0,.15)', paddingLeft: hot ? 14 : 0 }}
      >
        {hot ? `Đã bán ${short(sold)}` : 'Đang bán chạy'}
      </span>
    </div>
  );
}
