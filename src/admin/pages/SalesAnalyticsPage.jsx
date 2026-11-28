import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Download, ExternalLink, Info } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, formatPrice, imgFallback } from '../../lib/api';
import { adminApi } from '../adminApi';
import { MultiLineChart, compactVnd } from '../charts';
import { Card, ErrorBox, Input, Spinner } from '../ui';

// Trang "Phân tích bán hàng" như Data Center của Shopee: chọn khung thời gian, các ô chỉ số so với kỳ trước,
// bấm ô để thêm vào biểu đồ (tối đa 4), cơ cấu đơn, hiệu quả từng sản phẩm, tải dữ liệu CSV.

const VN = 7 * 3600e3;
const today = () => new Date(Date.now() + VN).toISOString().slice(0, 10);
const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const monthStart = (day) => `${day.slice(0, 8)}01`;
const prevMonth = (day) => {
  const d = new Date(Date.parse(`${monthStart(day)}T00:00:00Z`) - 864e5);
  const end = d.toISOString().slice(0, 10);
  return [monthStart(end), end];
};
const dmy = (day) => day.split('-').reverse().join('/');

const PRESETS = [
  ['today', 'Hôm nay', () => [today(), today()]],
  ['yesterday', 'Hôm qua', () => [addDays(today(), -1), addDays(today(), -1)]],
  ['7', '7 ngày qua', () => [addDays(today(), -6), today()]],
  ['30', '30 ngày qua', () => [addDays(today(), -29), today()]],
  ['month', 'Tháng này', () => [monthStart(today()), today()]],
  ['lastMonth', 'Tháng trước', () => prevMonth(today())],
];

const num = (n) => Math.round(n || 0).toLocaleString('vi-VN');
const pct = (n) => `${(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
const vnd = (n) => `₫${num(n)}`;

// Màu các đường (theo thứ tự chọn) – giống Shopee: cam, xanh, tím, xanh lá
const LINE_COLORS = ['#ee4d2d', '#2673dd', '#7c3aed', '#16a34a'];

const METRICS = [
  { key: 'revenue', label: 'Doanh số', fmt: vnd, short: (v) => `₫${compactVnd(v)}`, tip: 'Tổng tiền các đơn không huỷ', series: true },
  { key: 'orders', label: 'Đơn hàng', fmt: num, tip: 'Số đơn không huỷ', series: true },
  { key: 'items', label: 'Sản phẩm đã bán', fmt: num, tip: 'Tổng số lượng sản phẩm trong các đơn không huỷ', series: true },
  { key: 'avgOrder', label: 'Doanh số / đơn', fmt: vnd, short: (v) => `₫${compactVnd(v)}`, tip: 'Giá trị trung bình mỗi đơn' },
  { key: 'buyers', label: 'Người mua', fmt: num, tip: 'Số khách (SĐT) khác nhau có đơn' },
  { key: 'visits', label: 'Lượt truy cập', fmt: num, tip: 'Số khách khác nhau vào web mỗi ngày', series: true, daily: true },
  { key: 'productViews', label: 'Lượt xem sản phẩm', fmt: num, tip: 'Số lần mở trang chi tiết sản phẩm', series: true, daily: true },
  { key: 'conversion', label: 'Tỉ lệ chuyển đổi', fmt: pct, tip: 'Đơn hàng / lượt truy cập' },
  { key: 'cancelled', label: 'Đơn huỷ', fmt: num, tip: 'Số đơn bị huỷ trong kỳ', series: true, bad: true },
  { key: 'paid', label: 'Đã thu tiền', fmt: vnd, short: (v) => `₫${compactVnd(v)}`, tip: 'Tiền các đơn đã thanh toán (CK đã nhận / COD đã giao)' },
];

const delta = (cur, prev) => (prev ? ((cur - prev) / prev) * 100 : cur ? null : 0);

function Delta({ cur, prev, bad }) {
  const d = delta(cur, prev);
  if (d == null) return <span className="text-gray-400">Mới</span>;
  if (!Number.isFinite(d) || d === 0) return <span className="text-gray-400">0,00%</span>;
  const up = d > 0;
  const good = bad ? !up : up;
  return (
    <span className={`font-semibold ${good ? 'text-emerald-600' : 'text-red-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(d).toFixed(2).replace('.', ',')}%
    </span>
  );
}

const PAY_LABEL = { BANK: 'Chuyển khoản', COD: 'Thanh toán khi nhận (COD)' };
const DELIVERY_LABEL = { HOME: 'Giao tận nhà', STORE: 'Nhận tại shop' };
const STATUS_LABEL = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã huỷ' };

const PRODUCT_TABS = [
  ['best', 'Bán chạy', (p) => p.revenue > 0, 'revenue'],
  ['views', 'Xem nhiều', (p) => p.views > 0, 'views'],
  ['noorder', 'Xem nhiều chưa ra đơn', (p) => p.views > 0 && !p.orders, 'views'],
];
const COLS = [
  ['revenue', 'Doanh số', vnd],
  ['orders', 'Đơn hàng', num],
  ['quantity', 'SL bán', num],
  ['buyers', 'Người mua', num],
  ['views', 'Lượt xem', num],
  ['conversion', 'Tỉ lệ chuyển đổi', (v) => (v == null ? '—' : pct(v))],
];

const downloadCsv = (name, rows) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + rows.map((r) => r.map(esc).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

export default function SalesAnalyticsPage() {
  const [preset, setPreset] = useState('today');
  const [range, setRange] = useState(() => PRESETS[0][2]());
  const [picked, setPicked] = useState(['revenue', 'orders']);
  const [ptab, setPtab] = useState('best');
  const [sort, setSort] = useState(null);
  const [limit, setLimit] = useState(10);
  const [from, to] = range;
  const { data, loading, error, reload } = useFetch(() => adminApi.analytics(from, to), [from, to]);

  const choose = (key) => {
    setPreset(key);
    setRange(PRESETS.find((p) => p[0] === key)[2]());
    setLimit(10);
  };
  const setCustom = (f, t) => {
    if (!f || !t || f > t) return;
    setPreset('custom');
    setRange([f, t]);
  };

  const togglePick = (key) =>
    setPicked((p) => (p.includes(key) ? (p.length > 1 ? p.filter((k) => k !== key) : p) : p.length >= 4 ? [...p.slice(1), key] : [...p, key]));

  const [tabKey, , tabFilter, tabSort] = PRODUCT_TABS.find((t) => t[0] === ptab);
  const sortKey = sort || tabSort;
  const products = useMemo(
    () => (data?.products || []).filter(tabFilter).sort((a, b) => (b[sortKey] ?? -1) - (a[sortKey] ?? -1)),
    [data, tabFilter, sortKey]
  );

  if (loading && !data) return <Spinner />;
  if (error && !data) return <ErrorBox error={error} onRetry={reload} />;
  if (!data) return null;

  const cur = data.current;
  const prev = data.previous;
  const chartSeries = picked
    .map((k, i) => {
      const m = METRICS.find((x) => x.key === k);
      if (!m?.series || (m.daily && data.hourly)) return null;
      return { key: k, label: m.label, color: LINE_COLORS[i % LINE_COLORS.length], format: m.fmt };
    })
    .filter(Boolean);
  const series = data.series.map((s) => ({ ...s, date: s.key }));
  const vsText = data.hourly && from === to ? `so với ${dmy(data.prevFrom)}` : `so với ${dmy(data.prevFrom)} – ${dmy(data.prevTo)}`;
  const totalRevenue = cur.revenue || 1;

  const exportCsv = () => {
    const rows = [
      [`Phân tích bán hàng TriTech Channel ${dmy(from)} – ${dmy(to)}`],
      [],
      ['Chỉ số', 'Kỳ này', 'Kỳ trước'],
      ...METRICS.map((m) => [m.label, cur[m.key], prev[m.key]]),
      [],
      ['Thời gian', 'Doanh số', 'Đơn hàng', 'SP đã bán', 'Lượt truy cập', 'Lượt xem SP', 'Đơn huỷ'],
      ...data.series.map((s) => [s.key, s.revenue, s.orders, s.items, s.visits ?? '', s.productViews ?? '', s.cancelled]),
      [],
      ['Sản phẩm', 'Danh mục', 'Doanh số', 'Đơn hàng', 'SL bán', 'Người mua', 'Lượt xem', 'Tỉ lệ chuyển đổi (%)', 'Tồn kho'],
      ...data.products.map((p) => [p.name, p.category, p.revenue, p.orders, p.quantity, p.buyers, p.views, p.conversion ?? '', p.stock ?? '']),
    ];
    downloadCsv(`phan-tich-ban-hang_${from}_${to}.csv`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Link to="/admin" className="hover:text-gray-900">Tổng quan</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-gray-900">Phân tích bán hàng</span>
      </div>

      {/* Khung thời gian */}
      <Card className="flex flex-wrap items-center gap-2 p-3">
        <span className="mr-1 text-sm text-gray-500">Khung thời gian</span>
        {PRESETS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => choose(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${preset === key ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
          >
            {label}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <Input type="date" value={from} max={to} onChange={(e) => setCustom(e.target.value, to)} className="w-36 py-1.5 text-xs" />
          <span className="text-gray-400">–</span>
          <Input type="date" value={to} min={from} max={today()} onChange={(e) => setCustom(from, e.target.value)} className="w-36 py-1.5 text-xs" />
        </div>
        <button type="button" onClick={exportCsv} className="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
          <Download size={14} /> Tải dữ liệu
        </button>
      </Card>

      {/* Tổng quan: các ô chỉ số + biểu đồ */}
      <Card className={`p-4 ${loading ? 'opacity-70' : ''}`}>
        <div className="mb-3 flex flex-wrap items-baseline gap-2">
          <h2 className="text-lg font-bold text-gray-900">Tổng quan</h2>
          <span className="text-xs text-gray-400">{dmy(from)}{from !== to ? ` – ${dmy(to)}` : ''} · {vsText}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
          {METRICS.map((m) => {
            const idx = picked.indexOf(m.key);
            const on = idx >= 0;
            return (
              <button
                key={m.key}
                type="button"
                title={m.tip}
                onClick={() => togglePick(m.key)}
                className={`relative rounded-lg border bg-white px-3 py-2.5 text-left transition-shadow hover:shadow-md ${on ? 'border-transparent shadow-md' : 'border-gray-200'}`}
                style={on ? { borderTop: `3px solid ${LINE_COLORS[idx % LINE_COLORS.length]}` } : undefined}
              >
                <p className="flex items-center gap-1 text-xs text-gray-500">{m.label} <Info size={11} className="text-gray-300" /></p>
                <p className="mt-1 text-lg font-bold tabular-nums text-gray-900">{m.fmt(cur[m.key])}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  so với kỳ trước <Delta cur={cur[m.key]} prev={prev[m.key]} bad={m.bad} />
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">Biểu đồ {data.hourly ? 'theo giờ' : 'theo ngày'}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              {chartSeries.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.label}
                </span>
              ))}
              <span className="text-gray-400">Đã chọn {picked.length}/4</span>
            </div>
          </div>
          {chartSeries.length ? (
            <MultiLineChart data={series} series={chartSeries} />
          ) : (
            <p className="py-12 text-center text-sm text-gray-400">Chỉ số đang chọn không vẽ theo thời gian được – bấm Doanh số, Đơn hàng… để thêm vào biểu đồ</p>
          )}
          {data.hourly && picked.some((k) => METRICS.find((m) => m.key === k)?.daily) && (
            <p className="mt-1 text-[11px] text-gray-400">Lượt truy cập / lượt xem chỉ thống kê theo ngày – chọn từ 2 ngày trở lên để xem đường biểu diễn.</p>
          )}
        </div>
      </Card>

      {/* Cơ cấu */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Breakdown title="Phương thức thanh toán" rows={data.payment.map((r) => ({ label: PAY_LABEL[r.key] || r.key, value: r.revenue, sub: `${r.orders} đơn` }))} total={totalRevenue} />
        <Breakdown title="Hình thức nhận hàng" rows={data.delivery.map((r) => ({ label: DELIVERY_LABEL[r.key] || r.key, value: r.revenue, sub: `${r.orders} đơn` }))} total={totalRevenue} />
        <Card className="p-4">
          <h3 className="mb-3 font-bold text-gray-900">Khách mua</h3>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-2xl font-black text-gray-900">{num(data.customers.new)}</p>
              <p className="text-xs text-gray-500">Khách mới</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-600">{num(data.customers.returning)}</p>
              <p className="text-xs text-gray-500">Khách quay lại</p>
            </div>
          </div>
          {data.customers.total > 0 && (
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-100">
              <span className="bg-gray-800" style={{ width: `${(data.customers.new / data.customers.total) * 100}%` }} />
              <span className="bg-blue-500" style={{ width: `${(data.customers.returning / data.customers.total) * 100}%` }} />
            </div>
          )}
          <p className="mt-2 text-[11px] text-gray-400">Khách quay lại = SĐT đã từng mua trước khoảng thời gian này</p>
        </Card>
        <Card className="p-4">
          <h3 className="mb-3 font-bold text-gray-900">Đơn theo trạng thái</h3>
          <ul className="space-y-1.5 text-sm">
            {data.status.length ? (
              data.status
                .sort((a, b) => b.orders - a.orders)
                .map((r) => (
                  <li key={r.key} className="flex justify-between">
                    <span className="text-gray-600">{STATUS_LABEL[r.key] || r.key}</span>
                    <b>{r.orders}</b>
                  </li>
                ))
            ) : (
              <li className="text-gray-400">Chưa có đơn</li>
            )}
          </ul>
          <p className="mt-2 text-[11px] text-gray-400">Tỉ lệ huỷ: {pct(cur.cancelRate)}</p>
        </Card>
      </div>

      {data.categories.length > 0 && (
        <Breakdown title="Doanh số theo danh mục" rows={data.categories.map((c) => ({ label: c.name, value: c.revenue }))} total={totalRevenue} wide />
      )}

      {/* Hiệu quả sản phẩm */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 pt-3">
          <h2 className="pb-2 text-lg font-bold text-gray-900">Hiệu quả của sản phẩm</h2>
          <div className="flex gap-1">
            {PRODUCT_TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPtab(key);
                  setSort(null);
                  setLimit(10);
                }}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${tabKey === key ? 'border-red-500 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
                <th className="w-12 px-3 py-2.5 text-center font-semibold">Hạng</th>
                <th className="px-3 py-2.5 font-semibold">Thông tin sản phẩm</th>
                {COLS.map(([key, label]) => (
                  <th key={key} className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">
                    <button type="button" onClick={() => setSort(key)} className={`hover:text-gray-900 ${sortKey === key ? 'text-red-600' : ''}`}>
                      {label} {sortKey === key ? '↓' : ''}
                    </button>
                  </th>
                ))}
                <th className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, limit).map((p, i) => (
                <tr key={p.productId ?? p.name} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'text-gray-500'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-[240px] items-center gap-2.5">
                      <img src={assetUrl(p.image)} onError={imgFallback} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-gray-100 object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-medium text-gray-800">{p.name}</p>
                        <p className="flex items-center gap-2 text-[11px] text-gray-400">
                          {p.category || 'Chưa có danh mục'}
                          {p.productId && (
                            <Link to={`/admin/products/${p.productId}`} className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                              Sửa <ExternalLink size={10} />
                            </Link>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  {COLS.map(([key, , fmt]) => (
                    <td key={key} className={`whitespace-nowrap px-3 py-2.5 text-right tabular-nums ${sortKey === key ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {fmt(p[key])}
                    </td>
                  ))}
                  <td className={`whitespace-nowrap px-3 py-2.5 text-right tabular-nums ${p.stock != null && p.stock <= 0 ? 'font-bold text-red-600' : 'text-gray-700'}`}>
                    {p.stock == null ? '—' : p.stock <= 0 ? 'Hết' : num(p.stock)}
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td colSpan={COLS.length + 3} className="py-10 text-center text-sm text-gray-400">
                    Chưa có dữ liệu trong khoảng thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {products.length > limit && (
          <button type="button" onClick={() => setLimit((l) => l + 20)} className="w-full border-t border-gray-100 py-2.5 text-sm font-semibold text-blue-600 hover:bg-gray-50">
            Xem thêm ({products.length - limit} sản phẩm)
          </button>
        )}
      </Card>
    </div>
  );
}

function Breakdown({ title, rows, total, wide }) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  return (
    <Card className={`p-4 ${wide ? '' : ''}`}>
      <h3 className="mb-3 font-bold text-gray-900">{title}</h3>
      {sorted.length ? (
        <ul className={wide ? 'grid gap-x-8 gap-y-2.5 md:grid-cols-2' : 'space-y-2.5'}>
          {sorted.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between gap-2 text-sm">
                <span className="truncate text-gray-700">{r.label}</span>
                <span className="shrink-0 font-semibold text-gray-900">
                  {formatPrice(r.value)} <span className="text-xs font-normal text-gray-400">{Math.round((r.value / total) * 100)}%{r.sub ? ` · ${r.sub}` : ''}</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <span className="block h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (r.value / total) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
      )}
    </Card>
  );
}
