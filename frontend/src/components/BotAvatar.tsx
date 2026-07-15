import React from 'react';

interface BotAvatarProps {
  expression?: 'idle' | 'speaking' | 'thinking' | 'excited' | 'happy' | 'blinking';
  size?: number;
}

/**
 * Cute Round Bot Avatar Component
 * SVG-based avatar with expressive large eyes and round design
 * Features:
 * - Super cute round alien/bot design
 * - Large pointed ears
 * - Big round eyes with expression
 * - Antenna on top
 * - Multiple facial expressions
 * - Smooth animations
 */
export const BotAvatar: React.FC<BotAvatarProps> = ({ 
  expression = 'idle', 
  size = 70 
}) => {
  const renderExpressiveEyes = () => {
    switch (expression) {
      case 'speaking':
        // Eyes looking happy and open, slight squint
        return (
          <>
            {/* Left eye - happy open with blink */}
            <g className="eye-white">
              <circle cx="30" cy="40" r="11" fill="white" />
            </g>
            <g className="eye-pupil">
              <circle cx="30" cy="42" r="7" fill="#3d3935" />
              <circle cx="32" cy="39" r="2.5" fill="white" />
            </g>

            {/* Right eye - happy open with blink */}
            <g className="eye-white">
              <circle cx="54" cy="40" r="11" fill="white" />
            </g>
            <g className="eye-pupil">
              <circle cx="54" cy="42" r="7" fill="#3d3935" />
              <circle cx="56" cy="39" r="2.5" fill="white" />
            </g>

            {/* Happy smile with animation */}
            <g className="mouth">
              <path
                d="M 28 58 Q 42 65 56 58"
                stroke="#3d3935"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </>
        );

      case 'thinking':
        // Eyes looking upward (contemplating)
        return (
          <>
            {/* Left eye - looking up */}
            <g>
              <circle cx="30" cy="40" r="11" fill="white" />
              <circle cx="30" cy="36" r="7" fill="#3d3935" />
              <circle cx="32" cy="34" r="2.5" fill="white" />
            </g>

            {/* Right eye - looking up */}
            <g>
              <circle cx="54" cy="40" r="11" fill="white" />
              <circle cx="54" cy="36" r="7" fill="#3d3935" />
              <circle cx="56" cy="34" r="2.5" fill="white" />
            </g>

            {/* Neutral thinking mouth */}
            <path
              d="M 32 60 Q 42 62 52 60"
              stroke="#3d3935"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );

      case 'excited':
        // Eyes wide open with very big smile
        return (
          <>
            {/* Left eye - wide excited */}
            <g>
              <circle cx="30" cy="40" r="12" fill="white" />
              <circle cx="30" cy="40" r="8" fill="#3d3935" />
              <circle cx="32" cy="37" r="3" fill="white" />
            </g>

            {/* Right eye - wide excited */}
            <g>
              <circle cx="54" cy="40" r="12" fill="white" />
              <circle cx="54" cy="40" r="8" fill="#3d3935" />
              <circle cx="56" cy="37" r="3" fill="white" />
            </g>

            {/* Big excited smile */}
            <path
              d="M 25 58 Q 42 68 59 58"
              stroke="#3d3935"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );

      case 'happy':
        // Content happy expression
        return (
          <>
            {/* Left eye - happy with blink */}
            <g className="eye-white">
              <circle cx="30" cy="40" r="11" fill="white" />
            </g>
            <g className="eye-pupil">
              <circle cx="30" cy="41" r="7" fill="#3d3935" />
              <circle cx="32" cy="38" r="2.5" fill="white" />
            </g>

            {/* Right eye - happy with blink */}
            <g className="eye-white">
              <circle cx="54" cy="40" r="11" fill="white" />
            </g>
            <g className="eye-pupil">
              <circle cx="54" cy="41" r="7" fill="#3d3935" />
              <circle cx="56" cy="38" r="2.5" fill="white" />
            </g>

            {/* Gentle smile with animation */}
            <g className="mouth">
              <path
                d="M 30 58 Q 42 64 54 58"
                stroke="#3d3935"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </>
        );

      case 'blinking':
        // Eyes closed (blinking)
        return (
          <>
            {/* Left eye - closed */}
            <path d="M 22 40 Q 30 44 38 40" stroke="#3d3935" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Right eye - closed */}
            <path d="M 46 40 Q 54 44 62 40" stroke="#3d3935" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Smile stays */}
            <path
              d="M 30 58 Q 42 64 54 58"
              stroke="#3d3935"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );

      case 'idle':
      default:
        // Default cute neutral expression with animations
        return (
          <>
            {/* Left eye with blink animation */}
            <g className="eye-white">
              <circle cx="30" cy="40" r="11" fill="white" />
            </g>
            <g className="eye-pupil">
              <circle cx="30" cy="41" r="7" fill="#3d3935" />
              <circle cx="32" cy="38" r="2.5" fill="white" />
            </g>

            {/* Right eye with blink animation */}
            <g className="eye-white">
              <circle cx="54" cy="40" r="11" fill="white" />
            </g>
            <g className="eye-pupil">
              <circle cx="54" cy="41" r="7" fill="#3d3935" />
              <circle cx="56" cy="38" r="2.5" fill="white" />
            </g>

            {/* Subtle smile with animation */}
            <g className="mouth">
              <path
                d="M 32 57 Q 42 61 52 57"
                stroke="#3d3935"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Nose */}
            <circle cx="42" cy="50" r="2" fill="#3d3935" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 84 84"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
        flexShrink: 0,
      }}
    >
      {/* CSS Animations for lifelike movements */}
      <style>{`
        /* Automatic eye blink animation */
        @keyframes autoBlink {
          0%, 90%, 100% {
            opacity: 1;
            transform: scaleY(1);
          }
          93%, 97% {
            opacity: 0;
            transform: scaleY(0.1);
          }
        }

        /* Pupil movement animation - looking around */
        @keyframes pupilMove {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(2px, -1px);
          }
          50% {
            transform: translate(-1px, 1px);
          }
          75% {
            transform: translate(1px, 1px);
          }
        }

        /* Subtle smile animation */
        @keyframes smileAnimation {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-0.5px);
          }
        }

        /* Breathing effect for body */
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .eye-white {
          animation: autoBlink 5s ease-in-out infinite;
          transform-origin: center;
        }

        .eye-pupil {
          animation: pupilMove 8s ease-in-out infinite;
        }

        .mouth {
          animation: smileAnimation 3s ease-in-out infinite;
        }

        .body-main {
          animation: breathe 4s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Define gradients and filters */}
      <defs>
        {/* Main body gradient - bright lime to olive green */}
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d4e844', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#c1d732', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#9fb000', stopOpacity: 1 }} />
        </linearGradient>

        {/* Ear gradient */}
        <linearGradient id="earGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d4e844', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#b8d428', stopOpacity: 1 }} />
        </linearGradient>

        {/* Antenna gradient - bright yellow */}
        <linearGradient id="antennaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f4e644', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f9e94a', stopOpacity: 1 }} />
        </linearGradient>

        {/* Body shine */}
        <radialGradient id="bodyShine" cx="40%" cy="30%">
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Shadow beneath bot */}
      <ellipse cx="42" cy="73" rx="22" ry="6" fill="#000" opacity="0.12" />

      {/* Main body - very round with breathing animation */}
      <g className="body-main">
        <path
          d="M 42 15 
             C 60 15 70 25 70 40
             C 70 60 60 68 42 70
             C 24 68 14 60 14 40
             C 14 25 24 15 42 15 Z"
          fill="url(#bodyGradient)"
        />

        {/* Body highlight/shine */}
        <ellipse cx="42" cy="25" rx="18" ry="14" fill="url(#bodyShine)" />
      </g>

      {/* Left Ear - Large and round */}
      <g>
        <ellipse cx="18" cy="30" rx="12" ry="16" fill="url(#earGradient)" />
        {/* Ear inner shadow for depth */}
        <ellipse cx="18" cy="30" rx="7" ry="10" fill="#9fb000" opacity="0.3" />
      </g>

      {/* Right Ear - Large and round */}
      <g>
        <ellipse cx="66" cy="30" rx="12" ry="16" fill="url(#earGradient)" />
        {/* Ear inner shadow for depth */}
        <ellipse cx="66" cy="30" rx="7" ry="10" fill="#9fb000" opacity="0.3" />
      </g>

      {/* Antenna - Simple stem */}
      <line x1="42" y1="15" x2="42" y2="5" stroke="#9fb000" strokeWidth="2.5" strokeLinecap="round" />
      {/* Antenna ball - bright yellow */}
      <circle cx="42" cy="4" r="4" fill="url(#antennaGradient)" />

      {/* Face area - large white oval for eyes */}
      <ellipse cx="42" cy="45" r="20" fill="white" opacity="0.95" />

      {/* Expressive face - eyes and mouth */}
      {renderExpressiveEyes()}
    </svg>
  );
};
