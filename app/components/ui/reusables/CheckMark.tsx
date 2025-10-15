"use client";
export const Checkmark = () => {
  return (
    <div className="w-16 h-16 mx-auto mb-6">
      <svg viewBox="0 0 52 52" className="w-full h-full stroke-green-500 stroke-2" fill="none">
        <circle
          cx="26"
          cy="26"
          r="25"
          style={{
            strokeDasharray: 157,
            strokeDashoffset: 157,
            animation: "draw-circle 1.2s ease-out forwards, reset-circle 2.4s linear infinite",
          }}
        />
        <path
          d="M14 27l7 7 16-16"
          style={{
            strokeDasharray: 48,
            strokeDashoffset: 48,
            animation: "draw-check 0.6s 0.6s ease-out forwards, reset-check 2.4s linear infinite",
          }}
        />
      </svg>

      <style>
        {`
          @keyframes draw-circle {
            to { stroke-dashoffset: 0; }
          }
          @keyframes draw-check {
            to { stroke-dashoffset: 0; }
          }

          @keyframes reset-circle {
            0%, 80% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 157; }
          }

          @keyframes reset-check {
            0%, 80% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 48; }
          }
        `}
      </style>
    </div>
  );
};
