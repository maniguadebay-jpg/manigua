import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { width?: number; height?: number };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function BallIcon({ width = 18, height = 18, ...rest }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.4 3 2.2-1.1 3.6h-3.8L9 9.6l3-2.2Z" />
      <path d="M12 3v2.2M4.4 9.4l2.6 1M6.9 19.2l2.2-2.6M17.1 19.2l-2.2-2.6M19.6 9.4l-2.6 1" />
    </svg>
  );
}

export function ChartIcon({ width = 18, height = 18, ...rest }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M4 19h16" />
      <path d="M7 19V9.5M12 19V5.5M17 19v-6.5" />
    </svg>
  );
}

export function AlertIcon({ width = 18, height = 18, ...rest }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M12 4.5 3.5 19h17L12 4.5Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

export function WhistleIcon({ width = 18, height = 18, ...rest }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M14 8h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-6Z" />
      <circle cx="8" cy="12" r="4.5" />
      <path d="M8 4.5V8" />
    </svg>
  );
}
