import React, { useState } from 'react';

export type Column<T> = {
  key: string;
  label: string;
  render?: (value: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
};

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  emptySubMessage?: string;
  getRowKey: (row: T) => string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'Aucune donnée',
  emptySubMessage,
  getRowKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full border-collapse">
        <thead>
          <tr className="border-b border-[#262626]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e] font-medium ${col.width ?? ''} ${col.sortable ? 'cursor-pointer select-none hover:text-[#a8a29e] transition-colors' : ''}`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="flex flex-col">
                      <svg className={`w-2.5 h-2.5 ${sortKey === col.key && sortDir === 'asc' ? 'text-[#c8b89a]' : 'text-[#262626]'}`} viewBox="0 0 10 10" fill="currentColor">
                        <path d="M5 2l4 5H1z" />
                      </svg>
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <p className="text-[#57534e] text-sm">{emptyMessage}</p>
                {emptySubMessage && <p className="text-[#57534e] text-xs mt-1">{emptySubMessage}</p>}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-[#a8a29e]">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
