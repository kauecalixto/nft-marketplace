import type { ReactNode, SVGProps } from 'react'

// Icones SVG inline (estilo traco, 24x24). Decorativos: sempre aria-hidden; o significado vem do texto ao lado.
function Icon({ children, className = 'size-5', ...rest }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} {...rest}>
      {children}
    </svg>
  )
}
type P = SVGProps<SVGSVGElement>

export const HomeIcon = (p: P) => <Icon {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></Icon>
export const CartIcon = (p: P) => <Icon {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.5L21 7H6" /></Icon>
export const UserIcon = (p: P) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>
export const WalletIcon = (p: P) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h13v4" /><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="16.5" cy="13.5" r="1.2" /></Icon>
export const LogoutIcon = (p: P) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Icon>
export const LoginIcon = (p: P) => <Icon {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></Icon>
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => <Icon {...p} fill={filled ? 'currentColor' : 'none'}><path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.6c0 5.9-8 10.6-8 10.6Z" /></Icon>
export const CheckIcon = (p: P) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>
export const CheckCircleIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="9.5" /><path d="m8 12.5 3 3 5-6" /></Icon>
export const AlertIcon = (p: P) => <Icon {...p}><path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4.5" /><path d="M12 17.3h.01" /></Icon>
export const InfoIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="9.5" /><path d="M12 11v5.5" /><path d="M12 7.7h.01" /></Icon>
export const ClockIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="9.5" /><path d="M12 7v5l3 2" /></Icon>
export const XCircleIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="9.5" /><path d="m9 9 6 6M15 9l-6 6" /></Icon>
export const SearchIcon = (p: P) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
export const SparkleIcon = (p: P) => <Icon {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" /><path d="M19 17v4M17 19h4" /></Icon>
export const PlusIcon = (p: P) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
export const MinusIcon = (p: P) => <Icon {...p}><path d="M5 12h14" /></Icon>
export const ReceiptIcon = (p: P) => <Icon {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></Icon>
export const ShieldIcon = (p: P) => <Icon {...p}><path d="M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></Icon>
export const UsersIcon = (p: P) => <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.2A6.5 6.5 0 0 1 21.5 20" /></Icon>
export const ChevronLeftIcon = (p: P) => <Icon {...p}><path d="m15 5-7 7 7 7" /></Icon>
export const SlidersIcon = (p: P) => <Icon {...p}><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></Icon>
export const TrashIcon = (p: P) => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Icon>

export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#e8932a" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#logo-g)" />
      <path d="m20 8 10 6v12l-10 6-10-6V14l10-6Z" fill="none" stroke="#1a0f08" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 14.5 25 17.5v5L20 25.5 15 22.5v-5l5-3Z" fill="#1a0f08" fillOpacity=".92" />
    </svg>
  )
}
