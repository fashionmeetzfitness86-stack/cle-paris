import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#262626] flex items-center justify-center text-[#57534e] mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-[#a8a29e]">{title}</p>
      {description && (
        <p className="text-xs text-[#57534e] mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
