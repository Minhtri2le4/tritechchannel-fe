import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SPECS = [
  ['Dung lượng', '25.000mAh'],
  ['Công suất tối đa', '165W'],
  ['Cáp USB-C', 'Tích hợp sẵn'],
  ['Bảo hành', '18 tháng 1 đổi 1'],
];

const STATS = [
  ['165W', 'Sạc laptop'],
  ['3 thiết bị', 'Sạc cùng lúc'],
  ['100%', 'Chính hãng'],
];

// Ảnh sạc bay lơ lửng: vị trí, kích thước, độ sâu (parallax) và nhịp trôi khác nhau
const FLOATERS = [
  { src: '/assets/a1695-duo.webp', className: 'left-[24%] top-[4%] w-[33%] md:w-[38%] md:left-[18%] md:top-[6%]', depth: 26, delay: '0s', duration: '7s' },
  { src: '/assets/a1695-mini.webp', className: 'right-[4%] top-[6%] w-[24%] md:w-[24%] md:right-[2%] md:top-[2%]', depth: 14, delay: '-2.5s', duration: '8.5s' },
  { src: '/assets/a1695-mini.webp', className: 'left-[2%] bottom-[6%] w-[17%] md:w-[17%] opacity-70 blur-[1px] -scale-x-100', depth: 8, delay: '-5s', duration: '9.5s' },
];

const TARGET = 25000;

// Số đếm lớn chạy từ 0 lên 25.000 khi khối hiện ra màn hình
function useCountUp(ref, target, ms = 1600) {
  const [value, setValue] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? target : 0
  );
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / ms);
        setValue(Math.round(target * (1 - (1 - t) ** 3)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, target, ms]);
  return value;
}

// Khối trưng bày sạc dự phòng Anker Zolo A1695 – nền tối, sản phẩm bay lơ lửng, rê chuột thì nghiêng theo
export default function AnkerShowcase({ to = '/category/12' }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const count = useCountUp(sectionRef, TARGET);

  // Parallax theo chuột (chỉ máy tính): ghi thẳng vào CSS variable, không render lại React
  const onMove = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    stage.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    stage.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    stageRef.current?.style.setProperty('--mx', '0');
    stageRef.current?.style.setProperty('--my', '0');
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="anker-showcase relative mb-10 overflow-hidden rounded-[24px] text-white shadow-lg"
    >
      <div className="relative grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-2 p-5 md:p-8 md:min-h-[460px]">
        {/* Cột chữ */}
        <div className="relative z-10 flex flex-col">
          <p className="text-[10px] md:text-xs tracking-[0.3em] text-white/50 uppercase">Anker Zolo · A1695</p>
          <h2 className="showcase-serif mt-2 text-3xl md:text-5xl leading-[0.95] uppercase">
            Sạc một lần
            <br />
            đi cả ngày
          </h2>
          <dl className="mt-5 text-xs md:text-sm border-t border-white/15">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2 border-b border-white/10">
                <dt className="text-white/55">{k}</dt>
                <dd className="font-semibold text-right flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]" />
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 md:mt-auto pt-2">
            <p className="text-[10px] tracking-[0.25em] text-white/45 uppercase">Dung lượng (mAh)</p>
            <p className="showcase-serif text-5xl md:text-7xl leading-none tabular-nums">{count.toLocaleString('vi-VN')}</p>
          </div>
          <Link
            to={to}
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#FFD400] px-6 py-3 text-sm font-extrabold text-black shadow-md transition-transform hover:scale-105"
          >
            XEM SẢN PHẨM <ArrowRight size={16} />
          </Link>
        </div>

        {/* Sân khấu sản phẩm bay */}
        <div ref={stageRef} className="showcase-stage relative order-first md:order-none h-[280px] md:h-auto md:min-h-[400px]" aria-hidden="true">
          {FLOATERS.map((f, i) => (
            <div key={i} className={`absolute ${f.className}`} style={{ '--depth': `${f.depth}px` }}>
              <div className="showcase-parallax">
                <img
                  src={f.src}
                  alt=""
                  loading="lazy"
                  className="showcase-float w-full h-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
                  style={{ animationDelay: f.delay, animationDuration: f.duration }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hàng số liệu dưới cùng */}
      <div className="relative grid grid-cols-3 border-t border-white/10 text-center">
        {STATS.map(([v, k]) => (
          <div key={k} className="py-3 md:py-4">
            <p className="showcase-serif text-lg md:text-2xl leading-none">{v}</p>
            <p className="mt-1 text-[10px] md:text-xs tracking-[0.15em] text-white/50 uppercase">{k}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
