/** Things young Indians actually finance, with typical prices + default tenors. */

export interface Want {
  id: string
  emoji: string
  label: string
  typicalPrice: number
  defaultMonths: number
  defaultRatePct: number
  blurb: string
}

export const WANTS: Want[] = [
  {
    id: 'phone',
    emoji: '📱',
    label: 'Phone',
    typicalPrice: 80000,
    defaultMonths: 12,
    defaultRatePct: 24,
    blurb: 'The flagship you saw on your feed.',
  },
  {
    id: 'laptop',
    emoji: '💻',
    label: 'Laptop',
    typicalPrice: 90000,
    defaultMonths: 18,
    defaultRatePct: 20,
    blurb: 'For "work" (and games).',
  },
  {
    id: 'bike',
    emoji: '🏍️',
    label: 'Bike',
    typicalPrice: 150000,
    defaultMonths: 36,
    defaultRatePct: 11,
    blurb: 'The upgrade from the scooter.',
  },
  {
    id: 'course',
    emoji: '🎓',
    label: 'Course',
    typicalPrice: 50000,
    defaultMonths: 12,
    defaultRatePct: 14,
    blurb: 'The bootcamp that changes everything.',
  },
  {
    id: 'custom',
    emoji: '➕',
    label: 'Custom ₹',
    typicalPrice: 30000,
    defaultMonths: 12,
    defaultRatePct: 18,
    blurb: 'Whatever you have your eye on.',
  },
]

export function getWant(id: string): Want {
  return WANTS.find((w) => w.id === id) ?? WANTS[WANTS.length - 1]
}
