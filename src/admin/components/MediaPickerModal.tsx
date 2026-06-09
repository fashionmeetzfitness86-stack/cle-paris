import { useState, useEffect, useCallback, useRef } from "react";
import { listMediaItems, uploadMedia } from "../services/media";
import type { MediaItem } from "../types";
import LoadingSpinner from "./LoadingSpinner";

type MediaFilter = "all" | "image" | "video";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the selected public URL */
  onSelect: (url: string) => void;
  filter?: MediaFilter;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  filter = "all",
}: MediaPickerModalProps) {
  const [items,    setItems]    = useState<MediaItem[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [uploading,setUploading]= useState(false);
  const [search,   setSearch]   = useState("");
  const [tab,      setTab]      = useState<MediaFilter>(filter);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await listMediaItems();
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const { url } = await uploadMedia(file);
      if (url) {
        const newItem: MediaItem = {
          id: `new-${Date.now()}`,
          url,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          created_at: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
      }
    }
    setUploading(false);
  };

  const displayed = items.filter((item) => {
    const matchesType = tab === "all" || item.mime_type.startsWith(tab);
    const matchesSearch = item.filename.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-3xl mx-4 bg-[#111] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <div>
            <h3 className="text-sm font-semibold text-[#e8e2d6]">Bibliothèque médias</h3>
            <p className="text-[10px] text-[#57534e] mt-0.5">Sélectionnez un fichier</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
            >
              {uploading ? "Envoi…" : "+ Uploader"}
            </button>
            <button
              onClick={onClose}
              className="text-[#57534e] hover:text-[#e8e2d6] transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>

        {/* Tabs + search */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1e1e1e]">
          {(["all", "image", "video"] as MediaFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTab(f)}
              className={`text-xs px-3 py-1 rounded border transition-colors ${
                tab === f
                  ? "border-[#c8b89a] text-[#c8b89a]"
                  : "border-[#262626] text-[#57534e] hover:border-[#333]"
              }`}
            >
              {f === "all" ? "Tous" : f === "image" ? "Images" : "Vidéos"}
            </button>
          ))}
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto text-xs bg-[#1a1a1a] border border-[#262626] rounded px-3 py-1.5 text-[#e8e2d6] placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors w-44"
          />
        </div>

        {/* Grid */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 130px)" }}>
          {loading ? (
            <div className="p-10 flex justify-center"><LoadingSpinner /></div>
          ) : displayed.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#57534e]">
              Aucun fichier trouvé. Uploadez des médias pour commencer.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-4">
              {displayed.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.url); onClose(); }}
                  className="group relative aspect-square rounded overflow-hidden border border-[#262626] hover:border-[#c8b89a] transition-colors"
                  title={item.filename}
                >
                  {item.mime_type.startsWith("image") ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center gap-1">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#57534e]">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <p className="text-[8px] text-[#57534e] truncate px-1 max-w-full">{item.filename}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#c8b89a]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
