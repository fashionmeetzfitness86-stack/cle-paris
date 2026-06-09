import type { OrderStatus } from '../types';

type BadgeVariant = OrderStatus | 'admin' | 'editor' | 'active' | 'archived' | 'published' | 'draft' | 'visible' | 'hidden';

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  paid: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  processing: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  shipped: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  delivered: 'bg-green-400/10 text-green-400 border-green-400/20',
  refunded: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
  admin: 'bg-[#e8e2d6]/10 text-[#e8e2d6] border-[#e8e2d6]/20',
  editor: 'bg-[#c8b89a]/10 text-[#c8b89a] border-[#c8b89a]/20',
  active: 'bg-green-400/10 text-green-400 border-green-400/20',
  archived: 'bg-stone-400/10 text-stone-400 border-stone-400/20',
  published: 'bg-green-400/10 text-green-400 border-green-400/20',
  draft: 'bg-stone-400/10 text-stone-400 border-stone-400/20',
  visible: 'bg-green-400/10 text-green-400 border-green-400/20',
  hidden: 'bg-stone-400/10 text-stone-400 border-stone-400/20',
};

const variantLabels: Record<BadgeVariant, string> = {
  pending: 'En attente',
  paid: 'Payé',
  processing: 'Traitement',
  shipped: 'Expédié',
  delivered: 'Livré',
  refunded: 'Remboursé',
  cancelled: 'Annulé',
  admin: 'Admin',
  editor: 'Éditeur',
  active: 'Actif',
  archived: 'Archivé',
  published: 'Publié',
  draft: 'Brouillon',
  visible: 'Visible',
  hidden: 'Masqué',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

export default function Badge({ variant, label }: BadgeProps) {
  const styles = variantStyles[variant] ?? 'bg-stone-400/10 text-stone-400 border-stone-400/20';
  const text = label ?? variantLabels[variant] ?? variant;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-medium border ${styles}`}>
      {text}
    </span>
  );
}
