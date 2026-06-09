interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-[#262626] px-4 py-3">
      <p className="text-xs text-[#57534e]">
        {start}–{end} sur {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="w-7 h-7 flex items-center justify-center rounded text-xs text-[#57534e] hover:text-[#a8a29e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Page précédente"
        >
          ‹
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${
                p === page
                  ? "bg-[#c8b89a] text-[#0f0f0f] font-semibold"
                  : "text-[#57534e] hover:text-[#a8a29e]"
              }`}
            >
              {p + 1}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="w-7 h-7 flex items-center justify-center rounded text-xs text-[#57534e] hover:text-[#a8a29e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Page suivante"
        >
          ›
        </button>
      </div>
    </div>
  );
}
