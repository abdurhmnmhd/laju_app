function baseProps(size, props) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    ...props,
  }
}

export function MessageCircleIcon({ size = 20, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}

export function SearchIcon({ size = 20, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  )
}

export function CloseIcon({ size = 22, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function MinusIcon({ size = 16, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function PlusIcon({ size = 16, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ArrowLeftIcon({ size = 18, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 14, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

export function CopyIcon({ size = 14, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <rect width="13" height="13" x="9" y="9" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function MenuIcon({ size = 20, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 14, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function GridIcon({ size = 16, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <rect width="7" height="7" x="3" y="3" rx="1.4" />
      <rect width="7" height="7" x="14" y="3" rx="1.4" />
      <rect width="7" height="7" x="14" y="14" rx="1.4" />
      <rect width="7" height="7" x="3" y="14" rx="1.4" />
    </svg>
  )
}

export function SendIcon({ size = 16, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  )
}

export function MapPinIcon({ size = 16, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  )
}

export function InfoIcon({ size = 16, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export function AlertIcon({ size = 16, ...props }) {
  return (
    <svg {...baseProps(size, props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  )
}
