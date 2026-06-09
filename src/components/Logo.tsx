let idCounter = 0;

export default function Logo({ size = 32 }: { size?: number }) {
  const id = `ad-logo-${++idCounter}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#165DFF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="20" fill={`url(#${id}-grad)`} />
      <circle cx="30" cy="50" r="11" fill="white" opacity="0.95" />
      <circle cx="30" cy="50" r="5" fill="#165DFF" />
      <circle cx="70" cy="50" r="11" fill="white" opacity="0.95" />
      <circle cx="70" cy="50" r="5" fill="#7C3AED" />
      <line x1="41" y1="50" x2="59" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <circle cx="50" cy="50" r="3.5" fill="white" filter={`url(#${id}-glow)`} />
    </svg>
  );
}
