interface KakaoIconProps {
  className?: string;
}

export function KakaoIcon({ className }: KakaoIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.734 1.803 5.127 4.5 6.478-.152.543-.488 1.96-.56 2.267-.088.383.141.378.297.275.122-.081 1.96-1.316 2.754-1.852.644.093 1.314.141 1.999.141 5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3z" />
    </svg>
  );
}
