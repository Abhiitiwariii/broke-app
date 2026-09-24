/**
 * Mocked partner registry (plan.md §6). Rendered ONLY inside genuinely
 * money-saving contexts and clearly labelled "Partner offer • estimate".
 * All urls are '#'; wire real affiliate links later. Never framed as
 * "take another loan".
 */

export type PartnerKind = 'consolidation' | 'nocost-emi' | 'card'

export interface Partner {
  id: string
  label: string
  kind: PartnerKind
  url: string
  note: string
}

export const PARTNERS: Partner[] = [
  {
    id: 'nocost-emi-1',
    label: 'No-Cost EMI on this purchase',
    kind: 'nocost-emi',
    url: '#',
    note: 'Split the price into 0% interest instalments instead of a 24% loan — same total, no extra.',
  },
  {
    id: 'consolidate-1',
    label: 'Consolidate high-interest debt',
    kind: 'consolidation',
    url: '#',
    note: 'Move 40%+ card debt to a single lower-rate loan so more of each rupee kills principal.',
  },
  {
    id: 'card-1',
    label: 'Lower-APR balance transfer card',
    kind: 'card',
    url: '#',
    note: 'A 0% intro-APR window can buy time to clear the balance interest-free.',
  },
]

export function partnersByKind(kind: PartnerKind): Partner[] {
  return PARTNERS.filter((p) => p.kind === kind)
}
