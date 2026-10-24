/* eslint-disable react-refresh/only-export-components */
// Biểu đồ SVG nhẹ cho trang quản trị (không cần thư viện ngoài).
// 1 biểu đồ = 1 chuỗi số liệu, 1 trục. Rê chuột / chạm để xem số liệu từng ngày.
import { useEffect, useRef, useState } from 'react';

const INK_MUTED = '#6b7280'; // gray-500 – chữ trục
const GRID = '#e5e7eb'; // gray-200 – lưới mờ
const SURFACE = '#ffffff';
const PAD = { top: 12, right: 12, bottom: 26, left: 52 };

// Rút gọn số: 1.250.000 -> 1,3tr ; 12.000 -> 12k
export const compactVnd = (n) => {
  const a = Math.abs(n);
  if (a >= 1e9) return `${+(n / 1e9).toFixed(1)}tỷ`;
  if (a >= 1e6) return `${+(n / 1e6).toFixed(1)}tr`;
  if (a >= 1e3) return `${+(n / 1e3).toFixed(0)}k`;
  return String(n);
};

// Mốc trục Y tròn số: 0, 1/4, 2/4... của giá trị "đẹp" gần nhất ≥ max
const niceMax = (max) => {
  if (max <= 0) return 4;
  const step = 10 ** Math.floor(Math.log10(max));
  const n = [1, 2, 2.5, 5, 10].find((m) => m * step >= max);
  return n * step;
};

const dayLabel = (iso) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

// Khung chung: trục Y, lưới, nhãn ngày trục X, vùng bắt rê chuột theo cột ngày, tooltip
function ChartFrame({ data, valueKey, height, format, tooltip, children }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  const n = data.length;
  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = height - PAD.top - PAD.bottom;
  const top = niceMax(Math.max(...data.map((d) => d[valueKey]), 0));
  const band = innerW / Math.max(n, 1);
  const x = (i) => PAD.left + band * i + band / 2;
  const y = (v) => PAD.top + innerH - (v / top) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  // Hiện khoảng 6–8 nhãn ngày để không chồng chữ
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 56))));

  const geo = { n, band, x, y, innerH, baseY: PAD.top + innerH, hover };
  const h = hover !== null ? data[hover] : null;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} className="block" onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={INK_MUTED}>
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <text key={d.date} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill={INK_MUTED}>
                {dayLabel(d.date)}
              </text>
            ) : null
          )}

          {children(geo)}

          {/* Vùng bắt chuột/chạm: cả cột ngày, rộng hơn nét vẽ */}
          {data.map((d, i) => (
            <rect
              key={d.date}
              x={PAD.left + band * i}
              y={PAD.top}
              width={band}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onTouchStart={() => setHover(i)}
            />
          ))}
        </svg>
      )}

      {h && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
          style={{ left: Math.min(Math.max(x(hover), 70), width - 70), top: Math.max(y(h[valueKey]) - 8, 40) }}
        >
          <p className="text-gray-300">{dayLabel(h.date)}</p>
          {tooltip(h)}
        </div>
      )}
    </div>
  );
}

// Biểu đồ vùng (xu hướng theo thời gian) – đường 2px, nền nhạt 10%
export function AreaChart({ data, valueKey, color = '#2563eb', height = 240, format = compactVnd, tooltip }) {
  return (
    <ChartFrame data={data} valueKey={valueKey} height={height} format={format} tooltip={tooltip}>
      {({ n, x, y, baseY, hover }) => {
        if (!n) return null;
        const pts = data.map((d, i) => `${x(i)},${y(d[valueKey])}`);
        const line = `M${pts.join('L')}`;
        const area = `${line}L${x(n - 1)},${baseY}L${x(0)},${baseY}Z`;
        const last = data[n - 1];
        return (
          <>
            <path d={area} fill={color} fillOpacity="0.1" />
            <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {hover !== null && (
              <>
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={baseY} stroke={INK_MUTED} strokeWidth="1" />
                <circle cx={x(hover)} cy={y(data[hover][valueKey])} r="4.5" fill={color} stroke={SURFACE} strokeWidth="2" />
              </>
            )}
            {hover === null && <circle cx={x(n - 1)} cy={y(last[valueKey])} r="4.5" fill={color} stroke={SURFACE} strokeWidth="2" />}
          </>
        );
      }}
    </ChartFrame>
  );
}

// Biểu đồ cột (số lượng theo ngày) – cột tối đa 24px, bo 4px ở đầu, vuông ở chân
export function ColumnChart({ data, valueKey, color = '#2563eb', height = 240, format = (v) => String(Math.round(v)), tooltip }) {
  return (
    <ChartFrame data={data} valueKey={valueKey} height={height} format={format} tooltip={tooltip}>
      {({ band, x, y, baseY, hover }) => {
        const w = Math.max(Math.min(24, band - 2), 1);
        const r = Math.min(4, w / 2);
        return data.map((d, i) => {
          const v = d[valueKey];
          if (!v) return null;
          const top = y(v);
          const h = baseY - top;
          const rr = Math.min(r, h);
          const left = x(i) - w / 2;
          const path = `M${left},${baseY}V${top + rr}Q${left},${top} ${left + rr},${top}H${left + w - rr}Q${left + w},${top} ${left + w},${top + rr}V${baseY}Z`;
          return <path key={d.date} d={path} fill={color} opacity={hover === null || hover === i ? 1 : 0.45} />;
        });
      }}
    </ChartFrame>
  );
}

// Thanh ngang xếp hạng (top sản phẩm) – nhãn chữ dùng màu chữ, thanh mang màu dữ liệu
export function BarList({ items, valueKey, label, format, color = '#2563eb', empty = 'Chưa có dữ liệu' }) {
  if (!items?.length) return <p className="py-8 text-center text-sm text-gray-500">{empty}</p>;
  const max = Math.max(...items.map((i) => i[valueKey]), 1);
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={label(it)} title={`${label(it)}: ${format(it[valueKey])}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
            <span className="truncate text-gray-800">{label(it)}</span>
            <span className="shrink-0 font-semibold text-gray-900 tabular-nums">{format(it[valueKey])}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full" style={{ width: `${(it[valueKey] / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
