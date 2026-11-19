import React, { useId, useState } from 'react';

interface EdykLogoProps {
  size?: number;
  customLogoUrl?: string;
  className?: string;
}

export const EdykLogo: React.FC<EdykLogoProps> = ({ size = 48, customLogoUrl, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const [imgError, setImgError] = useState(false);

  if (customLogoUrl && !imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative rounded-full overflow-hidden border border-[#E2B743]/70 bg-[#0D0E10] shrink-0 ${className}`}
      >
        <img
          src={customLogoUrl}
          alt="EDY-K Barbershop"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Emblema EDY-K Barbershop"
    >
      <defs>
        <linearGradient id={`gold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0A8" />
          <stop offset="30%" stopColor="#F4D013" />
          <stop offset="65%" stopColor="#E2B743" />
          <stop offset="100%" stopColor="#A67B1B" />
        </linearGradient>
        <linearGradient id={`goldDark-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2B743" />
          <stop offset="100%" stopColor="#8C6614" />
        </linearGradient>
        <radialGradient id={`obsidian-${uid}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1D1F24" />
          <stop offset="100%" stopColor="#08090B" />
        </radialGradient>
        <path id={`topArc-${uid}`} d="M 38,102 A 62,62 0 0,1 162,102" />
        <path id={`bottomArc-${uid}`} d="M 34,104 A 66,66 0 0,0 166,104" />
      </defs>

      {/* Outer dark bezel */}
      <circle cx="100" cy="100" r="97" fill={`url(#obsidian-${uid})`} stroke="#2C2E33" strokeWidth="2" />

      {/* Main metallic gold rings */}
      <circle cx="100" cy="100" r="91" fill="none" stroke={`url(#gold-${uid})`} strokeWidth="2.8" />
      <circle cx="100" cy="100" r="84" fill="none" stroke={`url(#goldDark-${uid})`} strokeWidth="1" opacity="0.85" />

      {/* Ornamental scrollwork / filigree ring */}
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke={`url(#gold-${uid})`}
        strokeWidth="1.4"
        strokeDasharray="6 4 2 4"
        opacity="0.75"
      />

      {/* Side decorative flourishes */}
      <path
        d="M22 86 C16 95, 16 105, 22 114 M178 86 C184 95, 184 105, 178 114"
        stroke={`url(#gold-${uid})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="100" r="2.2" fill="#F4D013" />
      <circle cx="176" cy="100" r="2.2" fill="#F4D013" />

      {/* Curved BARBER top inscription */}
      <text
        fill={`url(#gold-${uid})`}
        fontSize="11.5"
        fontWeight="700"
        fontFamily="Oswald, sans-serif"
        letterSpacing="3.4"
      >
        <textPath href={`#topArc-${uid}`} startOffset="50%" textAnchor="middle">
          BARBER
        </textPath>
      </text>

      {/* Gold Crown at top */}
      <g transform="translate(100, 62)">
        <path
          d="M-19 10 L-22 -5 L-10 3 L0 -11 L10 3 L22 -5 L19 10 Z"
          fill={`url(#gold-${uid})`}
          stroke="#0D0E10"
          strokeWidth="0.8"
        />
        <rect x="-19" y="11" width="38" height="3.2" rx="1.5" fill={`url(#gold-${uid})`} />
        <circle cx="-22" cy="-7" r="2" fill="#FFF0A8" />
        <circle cx="0" cy="-13" r="2.5" fill="#FFF0A8" />
        <circle cx="22" cy="-7" r="2" fill="#FFF0A8" />
      </g>

      {/* Center ribbon shield for EDY-K */}
      <path
        d="M26 83 Q100 73 174 83 L167 121 Q100 131 33 121 Z"
        fill="#0D0E10"
        stroke={`url(#gold-${uid})`}
        strokeWidth="2.4"
      />
      <path
        d="M32 87 Q100 78 168 87"
        stroke={`url(#goldDark-${uid})`}
        strokeWidth="0.8"
        opacity="0.7"
      />
      <path
        d="M37 117 Q100 125 163 117"
        stroke={`url(#goldDark-${uid})`}
        strokeWidth="0.8"
        opacity="0.7"
      />

      {/* EDY-K centerpiece wordmark */}
      <text
        x="100"
        y="112"
        textAnchor="middle"
        fontFamily="Oswald, Impact, sans-serif"
        fontWeight="700"
        fontSize="37"
        letterSpacing="2.5"
        fill={`url(#gold-${uid})`}
      >
        EDY-K
      </text>

      {/* Crossed Barber Scissors & Straight Razor below banner */}
      <g transform="translate(100, 141)" stroke={`url(#gold-${uid})`} strokeLinecap="round" strokeLinejoin="round">
        {/* Straight razor blade */}
        <path d="M-18 -9 L14 9 L19 6 L-12 -11 Z" fill={`url(#gold-${uid})`} stroke="none" />
        {/* Scissors blade */}
        <line x1="16" y1="-10" x2="-13" y2="9" strokeWidth="2.6" />
        <line x1="-10" y1="-8" x2="12" y2="10" strokeWidth="2" opacity="0.85" />
        {/* Scissors finger rings */}
        <circle cx="-17" cy="11" r="4.2" fill="none" strokeWidth="1.9" />
        <circle cx="17" cy="11" r="4.2" fill="none" strokeWidth="1.9" />
        {/* Pivot rivet */}
        <circle cx="0" cy="0" r="1.8" fill="#0D0E10" stroke={`url(#gold-${uid})`} strokeWidth="1.2" />
      </g>

      {/* Curved BARBERSHOP bottom inscription */}
      <text
        fill={`url(#gold-${uid})`}
        fontSize="11"
        fontWeight="700"
        fontFamily="Oswald, sans-serif"
        letterSpacing="2.6"
      >
        <textPath href={`#bottomArc-${uid}`} startOffset="50%" textAnchor="middle">
          BARBERSHOP
        </textPath>
      </text>
    </svg>
  );
};
