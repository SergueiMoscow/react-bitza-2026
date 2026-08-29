export type NavItem = {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Сводка', icon: '📊' },
  { to: '/rooms', label: 'Помещения', icon: '🏠' },
  { to: '/clients', label: 'Клиенты', icon: '👤' },
  { to: '/contracts', label: 'Договоры', icon: '📄' },
  { to: '/payments', label: 'Оплаты', icon: '💰' },
  { to: '/electricity', label: 'Электричество', icon: '⚡' },
  { to: '/gas', label: 'Газ', icon: '🔥' },
]
