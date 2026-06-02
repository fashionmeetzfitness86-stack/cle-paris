interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export default function Toggle({ id, checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-[#c8b89a]' : 'bg-[#262626]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out mt-0.5 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <p className="text-sm text-[#e8e2d6]">{label}</p>}
          {description && <p className="text-xs text-[#57534e]">{description}</p>}
        </div>
      )}
    </div>
  );
}
