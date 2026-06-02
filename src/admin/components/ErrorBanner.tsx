interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-[#f87171]">
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[#f87171]/60 hover:text-[#f87171] transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
