// Nền trang trí cho khối chương trình khuyến mãi (CampaignSection): ánh sáng + đổ bóng cho mọi dịp,
// cộng hoạ tiết riêng: halloween = mạng nhện, dơi, trăng, ánh cam; tet = chấm vàng lấp lánh.

// Mạng nhện ở góc (0,0): các sợi toả ra + các vòng võng vào trong
const SPOKES = [4, 22, 42, 62, 82].map((deg) => (deg * Math.PI) / 180);
const RINGS = [26, 52, 82, 116, 150];
const pt = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];

function Web({ className }) {
  const rings = RINGS.map((r) =>
    SPOKES.slice(1).reduce((d, a, i) => {
      const [x0, y0] = pt(SPOKES[i], r);
      const [x1, y1] = pt(a, r);
      const [cx, cy] = pt((SPOKES[i] + a) / 2, r * 0.82);
      return `${d}${i === 0 ? `M${x0.toFixed(1)} ${y0.toFixed(1)}` : ''} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }, '')
  );
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.9">
        {SPOKES.map((a, i) => {
          const [x, y] = pt(a, 175);
          return <path key={i} d={`M0 0 L${x.toFixed(1)} ${y.toFixed(1)}`} />;
        })}
        {rings.map((d, i) => <path key={i} d={d} />)}
      </g>
      {/* Con nhện treo trên sợi tơ */}
      <path d="M118 0 V62" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <g fill="rgba(0,0,0,0.65)">
        <circle cx="118" cy="68" r="5" />
        <circle cx="118" cy="61" r="3" />
        <path d="M113 66 l-6 -4 M113 69 l-7 1 M113 72 l-5 5 M123 66 l6 -4 M123 69 l7 1 M123 72 l5 5" stroke="rgba(0,0,0,0.65)" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

const BAT = 'M0 8 C3 3 6 3 8 6 C9 3 11 2 12 4 C13 2 15 3 16 6 C18 3 21 3 24 8 C21 7 19 9 18 11 C16 9 14 10 12 12 C10 10 8 9 6 11 C5 9 3 7 0 8Z';

const BATS = [
  { left: '12%', top: '10%', size: 34, delay: '0s', dur: '6s' },
  { left: '26%', top: '4%', size: 20, delay: '-2s', dur: '7s' },
  { left: '70%', top: '8%', size: 28, delay: '-1s', dur: '6.5s' },
  { left: '84%', top: '18%', size: 18, delay: '-3s', dur: '8s' },
  { left: '56%', top: '2%', size: 14, delay: '-4s', dur: '7.5s' },
];

function Halloween() {
  return (
    <>
      {/* Trăng tròn phát sáng */}
      <div
        className="absolute right-[6%] top-3 h-16 w-16 md:h-24 md:w-24 rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 40%, #fff6d5, #ffd98a 55%, #f0a640 100%)',
          boxShadow: '0 0 40px 12px rgba(255,190,90,0.35), 0 0 120px 40px rgba(255,140,40,0.18)',
          opacity: 0.85,
        }}
      />
      <Web className="absolute left-0 top-0 h-28 w-28 md:h-44 md:w-44" />
      <Web className="absolute right-0 top-0 h-24 w-24 md:h-36 md:w-36 -scale-x-100" />
      {BATS.map((b, i) => (
        <svg
          key={i}
          viewBox="0 0 24 13"
          width={b.size}
          className="campaign-bat absolute"
          style={{ left: b.left, top: b.top, animationDelay: b.delay, animationDuration: b.dur }}
          aria-hidden="true"
        >
          <path d={BAT} fill="rgba(10,0,0,0.7)" />
        </svg>
      ))}
      {/* Ánh cam bí ngô dưới đáy */}
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'radial-gradient(70% 90% at 50% 100%, rgba(255,120,20,0.35), transparent 70%)' }} />
    </>
  );
}

function Tet() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(255,215,0,0.35) 1.4px, transparent 1.6px)', backgroundSize: '22px 22px' }}
      />
      <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgba(255,215,0,0.28), transparent 70%)' }} />
    </>
  );
}

export default function CampaignBackdrop({ theme }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Chiều sâu chung: sáng ở trên giữa, tối dần ra mép */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,0.14), transparent 65%), radial-gradient(140% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.35) 100%)',
        }}
      />
      {theme === 'halloween' && <Halloween />}
      {theme === 'tet' && <Tet />}
    </div>
  );
}
