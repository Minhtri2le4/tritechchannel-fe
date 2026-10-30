import { useRef, useState } from 'react';

const ACTIONS = 168; // tổng bề rộng 2 nút khi mở

// Vuốt sang trái trên điện thoại (như giỏ hàng Shopee): hiện "Sản phẩm tương tự" + "Xóa";
// vuốt quá nửa dòng thì xóa luôn. Máy tính không có cảm ứng nên giữ nguyên.
export default function SwipeRow({ children, onDelete, onSimilar }) {
  const [x, setXState] = useState(0);
  const xRef = useRef(0); // vị trí mới nhất (state có thể chưa kịp cập nhật giữa các lần chạm)
  const setX = (v) => {
    xRef.current = v;
    setXState(v);
  };
  const [dragging, setDragging] = useState(false);
  const rowRef = useRef(null);
  const start = useRef(null);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, base: xRef.current, lock: null };
  };

  const onTouchMove = (e) => {
    const s = start.current;
    if (!s) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    // Chỉ coi là vuốt ngang khi kéo ngang rõ hơn kéo dọc, để vẫn cuộn trang được
    if (!s.lock) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) s.lock = 'h';
      else if (Math.abs(dy) > 8) s.lock = 'v';
    }
    if (s.lock !== 'h') return;
    setDragging(true);
    setX(Math.min(0, s.base + dx));
  };

  const onTouchEnd = () => {
    if (!start.current) return;
    const width = rowRef.current?.offsetWidth || 360;
    start.current = null;
    setDragging(false);
    const pulledNow = -xRef.current;
    if (pulledNow > width * 0.55) {
      setX(-width);
      setTimeout(onDelete, 180);
    } else if (pulledNow > ACTIONS / 2) setX(-ACTIONS);
    else setX(0);
  };

  const pulled = -x;
  const deleteWidth = Math.max(ACTIONS / 2, pulled - ACTIONS / 2);

  return (
    <div ref={rowRef} className="relative overflow-hidden">
      {pulled > 0 && (
        <div className="absolute inset-y-0 right-0 flex" style={{ width: Math.max(pulled, ACTIONS) }}>
          {pulled <= ACTIONS * 1.4 && (
            <button
              type="button"
              onClick={() => {
                setX(0);
                onSimilar();
              }}
              className="flex-1 bg-orange-500 px-2 text-center text-[13px] font-semibold leading-tight text-white"
            >
              Sản phẩm tương tự
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-600 text-[13px] font-semibold text-white"
            style={{ width: pulled > ACTIONS * 1.4 ? '100%' : deleteWidth }}
          >
            Xóa
          </button>
        </div>
      )}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        // Đang mở mà bấm vào nội dung thì chỉ đóng lại, không bấm nhầm vào nút bên trong
        onClickCapture={(e) => {
          if (x !== 0) {
            e.preventDefault();
            e.stopPropagation();
            setX(0);
          }
        }}
        className="relative bg-white"
        style={{ transform: `translateX(${x}px)`, transition: dragging ? 'none' : 'transform 0.2s ease-out', touchAction: 'pan-y' }}
      >
        {children}
      </div>
    </div>
  );
}
