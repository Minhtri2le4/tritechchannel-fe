import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';

// Ô ký tên bằng ngón tay / chuột. ref.current.toDataURL() -> ảnh PNG nền trong suốt (null nếu chưa ký)
const SignaturePad = forwardRef(function SignaturePad({ height = 180, onChange }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [empty, setEmpty] = useState(true);
  // Giữ hàm onChange mới nhất mà không vẽ lại khung (đổi khung = xoá chữ ký)
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  }, [onChange]);

  // Vẽ nét sắc trên màn hình độ phân giải cao
  useEffect(() => {
    const c = canvasRef.current;
    let lastW = 0;
    const fit = () => {
      const ratio = window.devicePixelRatio || 1;
      const w = c.offsetWidth;
      // Điện thoại ẩn/hiện thanh địa chỉ cũng báo resize – chỉ vẽ lại khi bề ngang thật sự đổi
      if (w === lastW) return;
      lastW = w;
      c.width = w * ratio;
      c.height = height * ratio;
      const ctx = c.getContext('2d');
      ctx.scale(ratio, ratio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0b1f5c';
      setEmpty(true);
      cb.current?.(false);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [height]);

  const point = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure || 0.5 };
  };
  const down = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const p = point(e);
    ctx.lineWidth = 1.6 + p.p * 2;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (empty) {
      setEmpty(false);
      cb.current?.(true);
    }
  };
  const up = () => {
    drawing.current = false;
  };
  const clear = () => {
    const c = canvasRef.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    cb.current?.(false);
  };

  useImperativeHandle(ref, () => ({
    toDataURL: () => (empty ? null : canvasRef.current.toDataURL('image/png')),
    clear,
  }));

  return (
    <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-white">
      <canvas
        ref={canvasRef}
        style={{ height, touchAction: 'none' }}
        className="block w-full cursor-crosshair"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      {empty && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">Ký tên vào đây</p>}
      <span className="pointer-events-none absolute bottom-8 left-6 right-6 border-b border-gray-200" />
      <button type="button" onClick={clear} className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200">
        <Eraser size={13} /> Ký lại
      </button>
    </div>
  );
});

export default SignaturePad;
