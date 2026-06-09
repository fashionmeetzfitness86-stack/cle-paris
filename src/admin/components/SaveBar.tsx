import { useEffect, useState } from "react";

interface SaveBarProps {
  hasChanges: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  saving?: boolean;
}

export default function SaveBar({ hasChanges, onSave, onDiscard, saving = false }: SaveBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasChanges) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [hasChanges]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 border-t border-[#262626] bg-[#141414]/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between transition-transform duration-300 ${
        hasChanges ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <p className="text-xs text-[#57534e]">Vous avez des modifications non sauvegardées</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onDiscard}
          disabled={saving}
          className="text-xs text-[#57534e] hover:text-[#a8a29e] transition-colors disabled:opacity-40"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-xs font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
        >
          {saving && (
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
