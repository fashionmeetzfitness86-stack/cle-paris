import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import { listMediaItems, uploadMedia, deleteMedia } from "../services/media";
import type { MediaItem } from "../types";
import { isSupabaseConfigured } from "../../lib/supabase";

type Filter = "all" | "image" | "video";
type Folder = "all" | "hero" | "products" | "images" | "videos";

const FOLDERS: { key: Folder; labelKey: string; prefix: string }[] = [
  { key: "all",      labelKey: "media.folderAll",      prefix: "" },
  { key: "hero",     labelKey: "media.folderHero",     prefix: "hero" },
  { key: "products", labelKey: "media.folderProducts", prefix: "products" },
  { key: "images",   labelKey: "media.folderImages",   prefix: "images" },
  { key: "videos",   labelKey: "media.folderVideos",   prefix: "videos" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { t } = useTranslation("admin");
  const [items,    setItems]    = useState<MediaItem[]>([]);
  const [filter,   setFilter]   = useState<Filter>("all");
  const [folder,   setFolder]   = useState<Folder>("all");
  const [loading,  setLoading]  = useState(false);
  const [uploading,setUploading]= useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [confirmId,setConfirmId]= useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const selectedFolder = FOLDERS.find((f) => f.key === folder);
    const { data, error: err } = await listMediaItems(selectedFolder?.prefix);
    if (err) setError((err as { message?: string }).message ?? t("media.loadError"));
    else if (data) setItems(data);
    setLoading(false);
  }, [folder, t]);

  useEffect(() => { void load(); }, [load]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const selectedFolder = FOLDERS.find((f) => f.key === folder);
    const prefix = selectedFolder?.prefix && selectedFolder.prefix !== "" ? selectedFolder.prefix : undefined;

    for (const file of Array.from(files)) {
      const { url, error: err } = await uploadMedia(file, prefix);
      if (err) { setError((err as { message?: string }).message ?? t("media.uploadError")); break; }
      if (url) {
        const newItem: MediaItem = {
          id: `media-${Date.now()}-${file.name}`,
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
    if (isSupabaseConfigured()) void load();
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    const item = items.find((i) => i.id === confirmId);
    if (!item) return;
    const { error: err } = await deleteMedia(item.filename);
    if (!err) setItems((prev) => prev.filter((i) => i.id !== confirmId));
    setConfirmId(null);
    if (lightbox?.id === confirmId) setLightbox(null);
  };

  const handleCopy = (url: string, id: string) => {
    void navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayed =
    filter === "all" ? items : items.filter((i) => i.mime_type.startsWith(filter));

  return (
    <div className="flex h-full min-h-screen">
      {/* ── Folder sidebar ──────────────────────────────────────── */}
      <aside className="w-44 shrink-0 border-r border-[#1e1e1e] p-4 space-y-1">
        <p className="text-[9px] uppercase tracking-widest text-[#57534e] mb-3">{t("media.folders")}</p>
        {FOLDERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFolder(f.key)}
            className={`w-full text-left text-xs px-3 py-2 rounded transition-colors ${
              folder === f.key
                ? "bg-[#1a1a1a] text-[#e8e2d6] border border-[#262626]"
                : "text-[#57534e] hover:text-[#a8a29e]"
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">{t("media.overline")}</p>
            <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">
              {t("media.title")}
            </h2>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
          >
            {uploading ? t("media.uploading") : t("media.upload")}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleUpload(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg py-6 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-[#c8b89a] bg-[#c8b89a]/5 scale-[1.01]"
              : "border-[#262626] hover:border-[#333]"
          }`}
        >
          <p className="text-xs text-[#57534e]">
            {uploading
              ? t("media.uploadingFull")
              : t("media.dropzone", { folder: t(FOLDERS.find((f) => f.key === folder)?.labelKey ?? "media.folderAll") })}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "image", "video"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                filter === f
                  ? "border-[#c8b89a] text-[#c8b89a]"
                  : "border-[#262626] text-[#57534e] hover:border-[#333]"
              }`}
            >
              {f === "all" ? t("media.filterAll") : f === "image" ? t("media.filterImages") : t("media.filterVideos")}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-[#57534e] self-center">
            {t("media.fileCount", { count: displayed.length })}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : displayed.length === 0 ? (
          <EmptyState
            title={t("media.emptyTitle")}
            description={t("media.emptyDesc")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {displayed.map((item) => (
              <div
                key={item.id}
                className="group relative bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setLightbox(item)}
              >
                {item.mime_type.startsWith("image") ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="aspect-square w-full object-cover"
                    muted
                    preload="metadata"
                  />
                )}
                <div className="p-2">
                  <p className="text-[10px] text-[#57534e] truncate">{item.filename}</p>
                  <p className="text-[9px] text-[#57534e] mt-0.5">{formatBytes(item.size_bytes)}</p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleCopy(item.url, item.id)}
                    className="w-8 h-8 rounded bg-[#1a1a1a] flex items-center justify-center text-[#e8e2d6] hover:text-[#c8b89a] transition-colors text-sm"
                    title={t("media.copyUrl")}
                  >
                    {copiedId === item.id ? "✓" : "⧉"}
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="w-8 h-8 rounded bg-[#1a1a1a] flex items-center justify-center text-[#57534e] hover:text-[#f87171] transition-colors text-sm"
                    title={t("media.delete")}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.mime_type.startsWith("image") ? (
              <img
                src={lightbox.url}
                alt={lightbox.filename}
                className="w-full h-full object-contain rounded-lg max-h-[75vh]"
              />
            ) : (
              <video
                src={lightbox.url}
                controls
                className="w-full rounded-lg max-h-[75vh]"
              />
            )}
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#e8e2d6]">{lightbox.filename}</p>
                <p className="text-xs text-[#57534e]">{formatBytes(lightbox.size_bytes)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(lightbox.url, lightbox.id)}
                  className="px-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#262626] rounded text-[#a8a29e] hover:text-[#c8b89a] hover:border-[#c8b89a] transition-colors"
                >
                  {copiedId === lightbox.id ? t("media.copied") : t("media.copyUrl")}
                </button>
                <button
                  onClick={() => setConfirmId(lightbox.id)}
                  className="px-3 py-1.5 text-xs bg-red-400/10 border border-red-400/20 rounded text-[#f87171] hover:bg-red-400/20 transition-colors"
                >
                  {t("media.delete")}
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  className="px-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#262626] rounded text-[#57534e] hover:text-[#e8e2d6] transition-colors"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ──────────────────────────────────────── */}
      {confirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setConfirmId(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm mx-4 bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[#e8e2d6] font-semibold mb-2">{t("media.deleteFileTitle")}</h3>
            <p className="text-[#a8a29e] text-sm mb-6">
              {t("media.deleteFileMessage")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 text-sm text-[#a8a29e] border border-[#262626] rounded hover:border-[#57534e] transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-400/10 text-[#f87171] border border-red-400/20 rounded hover:bg-red-400/20 transition-colors"
              >
                {t("media.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
