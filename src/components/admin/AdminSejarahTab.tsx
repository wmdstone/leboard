"use client";

/**
 * Admin CRUD for the public "Sejarah" tab (About page).
 *
 * Fully modular with Accordion/Chevron wrappers & Mobile-First responsive design.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Upload as UploadIcon,
  ArrowUp,
  ArrowDown,
  History,
  BookOpen,
  Users as UsersIcon,
  ChevronDown,
  Target,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { resolveImageUrl } from "@/lib/gdrive";
import { ImageUploader } from "@/components/ui/ImageUploader";
import type { SejarahSection, Personnel } from "@/lib/types";

// ---------- API helpers ----------
async function listSections(): Promise<SejarahSection[]> {
  const r = await apiFetch("/api/sejarahContent");
  if (!r.ok) return [];
  return (await r.json()) as SejarahSection[];
}
async function upsertSection(s: Partial<SejarahSection>) {
  const r = await apiFetch("/api/sejarahContent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s),
  });
  if (!r.ok) throw new Error("Gagal menyimpan bagian");
  return r.json();
}
async function listPersonnel(): Promise<Personnel[]> {
  const r = await apiFetch("/api/personnel");
  if (!r.ok) return [];
  const rows = (await r.json()) as Personnel[];
  return [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
async function savePersonnel(p: Partial<Personnel> & { id?: string }) {
  const isEdit = !!p.id;
  const r = await apiFetch(
    isEdit ? `/api/personnel/${p.id}` : "/api/personnel",
    {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    },
  );
  if (!r.ok) throw new Error("Gagal menyimpan personil");
  return r.json();
}
async function deletePersonnel(id: string) {
  const r = await apiFetch(`/api/personnel/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Gagal menghapus personil");
}
async function reorderPersonnel(items: { id: string; order: number }[]) {
  await apiFetch("/api/personnel/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

// ---------- Reusable UI Components ----------

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs sm:text-sm font-semibold text-foreground block">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] sm:text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function VisibilityToggle({
  visible,
  onChange,
}: {
  visible: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!visible);
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
        visible
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-border bg-muted/60 text-muted-foreground"
      }`}
      title={visible ? "Tampil di halaman publik" : "Disembunyikan"}
    >
      {visible ? (
        <Eye className="w-3.5 h-3.5" />
      ) : (
        <EyeOff className="w-3.5 h-3.5" />
      )}
      <span>{visible ? "Tampil" : "Sembunyi"}</span>
    </button>
  );
}

// Reusable Accordion Wrapper
function AccordionItem({
  title,
  subtitle,
  icon: Icon,
  defaultOpen = false,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all duration-200">
      {/* Header Accordion */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 sm:p-5 cursor-pointer select-none hover:bg-muted/30 active:bg-muted/50 transition-colors gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <div
            className={`p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:bg-muted transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Body Accordion */}
      {isOpen && (
        <div className="p-3.5 sm:p-6 pt-2 sm:pt-2 border-t border-border/60 space-y-4 animate-in fade-in-50 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------- Section Editor (Sejarah + Visi) ----------
function SectionEditor({
  keyName,
  fallbackTitle,
  icon: Icon,
  withMisi,
  defaultOpen = false,
}: {
  keyName: string;
  fallbackTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  withMisi?: boolean;
  defaultOpen?: boolean;
}) {
  const [row, setRow] = useState<SejarahSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(fallbackTitle);
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [visible, setVisible] = useState(true);
  const [misi, setMisi] = useState<
    { num: string; title: string; desc: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const hydrate = (s: SejarahSection | null) => {
    setRow(s);
    setTitle(s?.title || fallbackTitle);
    setBody(s?.body || "");
    setImageUrl(s?.imageUrl || "");
    setImagePath(s?.imagePath || "");
    setVisible(s?.visible ?? true);
    setMisi(s?.misi || []);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const all = await listSections();
      if (!alive) return;
      hydrate(all.find((s) => s.key === keyName) || null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyName]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertSection({
        id: row?.id || keyName,
        key: keyName,
        title: title.trim(),
        body: body,
        imageUrl,
        imagePath,
        visible,
        misi: withMisi ? misi : undefined,
      });
      setRow((prev) => ({ ...(prev as any), ...(saved || {}) }));
      toast.success("Bagian tersimpan");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const addMisi = () =>
    setMisi((m) => [
      ...m,
      { num: String(m.length + 1).padStart(2, "0"), title: "", desc: "" },
    ]);
  const removeMisi = (idx: number) =>
    setMisi((m) => m.filter((_, i) => i !== idx));
  const updateMisi = (
    idx: number,
    patch: Partial<{ num: string; title: string; desc: string }>,
  ) => setMisi((m) => m.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <AccordionItem
      title={fallbackTitle}
      subtitle={
        loading
          ? "Memuat data..."
          : visible
            ? "Status: Tampil"
            : "Status: Disembunyikan"
      }
      icon={Icon}
      defaultOpen={defaultOpen}
      actions={<VisibilityToggle visible={visible} onChange={setVisible} />}
    >
      <div className="space-y-4 pt-2">
        <Field label="Judul Konten">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 sm:h-10 rounded-xl border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Masukkan judul..."
          />
        </Field>

        <Field label="Isi / Deskripsi">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-input bg-background p-3 text-base sm:text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Tuliskan isi deskripsi di sini..."
          />
        </Field>

        <Field label="Foto Pendukung (Opsional)">
          <ImageUploader
            folder="sejarah"
            aspectRatio={16 / 9}
            title={imageUrl ? "Ganti Gambar" : "Unggah Gambar"}
            onUploadSuccess={(url, meta) => {
              setImageUrl(url);
              setImagePath(meta?.path || "");
            }}
          />
          {imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border max-w-xs sm:max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(imageUrl)}
                alt="preview"
                className="w-full aspect-video object-cover"
              />
            </div>
          )}
        </Field>

        {withMisi && (
          <div className="pt-4 space-y-3 border-t border-border">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                Daftar Misi ({misi.length})
              </h4>
              <button
                type="button"
                onClick={addMisi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Misi
              </button>
            </div>

            {misi.length === 0 ? (
              <p className="text-xs italic text-muted-foreground py-2">
                Belum ada misi ditambahkan. Klik "Tambah Misi".
              </p>
            ) : (
              <div className="space-y-3">
                {misi.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2.5 items-start p-3 rounded-xl border border-border bg-muted/20"
                  >
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                      <input
                        value={m.num}
                        onChange={(e) =>
                          updateMisi(idx, { num: e.target.value })
                        }
                        className="w-14 h-10 sm:h-9 rounded-lg border border-input bg-background px-2 text-xs sm:text-sm text-center font-bold focus:outline-none"
                        placeholder="01"
                      />
                      <button
                        type="button"
                        onClick={() => removeMisi(idx)}
                        className="sm:hidden p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Hapus misi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <input
                        value={m.title}
                        onChange={(e) =>
                          updateMisi(idx, { title: e.target.value })
                        }
                        placeholder="Judul poin misi"
                        className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs font-semibold focus:outline-none"
                      />
                      <textarea
                        value={m.desc}
                        onChange={(e) =>
                          updateMisi(idx, { desc: e.target.value })
                        }
                        rows={2}
                        placeholder="Deskripsi rincian misi"
                        className="w-full rounded-lg border border-input bg-background p-2.5 text-base sm:text-xs resize-y focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMisi(idx)}
                      className="hidden sm:block p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      title="Hapus misi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </AccordionItem>
  );
}

// ---------- Personnel Form (Modal Mobile-Optimized) ----------
function PersonnelForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Partial<Personnel> & { kind: "masyayikh" | "pengurus" };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial.name || "");
  const [role, setRole] = useState(initial.role || "");
  const [bio, setBio] = useState(initial.bio || "");
  const [sourceType, setSourceType] = useState<"drive" | "upload">(
    initial.sourceType || "drive",
  );
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl || "");
  const [photoPath, setPhotoPath] = useState(initial.photoPath || "");
  const [visible, setVisible] = useState(initial.visible ?? true);
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(
    () => (photoUrl ? resolveImageUrl(photoUrl) : ""),
    [photoUrl],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await savePersonnel({
        id: initial.id,
        kind: initial.kind,
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim(),
        sourceType,
        photoUrl: photoUrl.trim(),
        photoPath: sourceType === "upload" ? photoPath : "",
        order: initial.order ?? Date.now(),
        visible,
      });
      toast.success("Personil tersimpan");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              {initial.id ? "Edit Personil" : "Personil Baru"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Kategori:{" "}
              {initial.kind === "masyayikh" ? "Masyayikh" : "Pengurus"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VisibilityToggle visible={visible} onChange={setVisible} />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-sm">
          <Field label="Nama Lengkap (Wajib)">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama..."
              className="w-full h-11 sm:h-10 rounded-xl border border-input bg-background px-3 text-base sm:text-sm focus:outline-none"
            />
          </Field>

          <Field label="Jabatan / Peran (Opsional)">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="mis. Pengasuh Utama / Ketua"
              className="w-full h-11 sm:h-10 rounded-xl border border-input bg-background px-3 text-base sm:text-sm focus:outline-none"
            />
          </Field>

          <Field label="Bio Singkat (Opsional)">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Profil atau latar belakang singkat..."
              className="w-full rounded-xl border border-input bg-background p-3 text-base sm:text-sm resize-y focus:outline-none"
            />
          </Field>

          <Field label="Sumber Foto">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceType("drive")}
                className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                  sourceType === "drive"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Google Drive
              </button>
              <button
                type="button"
                onClick={() => setSourceType("upload")}
                className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                  sourceType === "upload"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <UploadIcon className="w-3.5 h-3.5" /> Unggah Direct
              </button>
            </div>
          </Field>

          {sourceType === "drive" ? (
            <Field
              label="Link Google Drive"
              hint="Pastikan akses Google Drive diatur ke 'Siapa saja yang memiliki link'."
            >
              <input
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPhotoPath("");
                }}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full h-11 sm:h-10 rounded-xl border border-input bg-background px-3 text-base sm:text-sm focus:outline-none"
              />
            </Field>
          ) : (
            <Field label="Unggah Foto">
              <ImageUploader
                folder="personnel"
                aspectRatio={1}
                title={photoUrl ? "Ganti Foto" : "Pilih Foto"}
                onUploadSuccess={(url, meta) => {
                  setPhotoUrl(url);
                  setPhotoPath(meta?.path || "");
                }}
              />
            </Field>
          )}

          {previewUrl && (
            <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-square relative max-w-[9rem] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-card shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Personnel Section ----------
function PersonnelSection({
  kind,
  title,
  icon: Icon,
  defaultOpen = false,
}: {
  kind: "masyayikh" | "pengurus";
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
}) {
  const [form, setForm] = useState<
    (Partial<Personnel> & { kind: "masyayikh" | "pengurus" }) | null
  >(null);
  const [list, setList] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  const onRefresh = React.useCallback(async () => {
    const all = await listPersonnel();
    setList(all.filter((p) => p.kind === kind));
    setLoading(false);
  }, [kind]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const all = await listPersonnel();
      if (!alive) return;
      setList(all.filter((p) => p.kind === kind));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [kind]);

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const a = list[idx];
    const b = list[target];
    const swapped: { id: string; order: number }[] = [
      { id: a.id, order: b.order ?? target },
      { id: b.id, order: a.order ?? idx },
    ];
    try {
      await reorderPersonnel(swapped);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Gagal mengurutkan");
    }
  };

  const del = async (p: Personnel) => {
    if (!confirm(`Hapus "${p.name}"?`)) return;
    try {
      await deletePersonnel(p.id);
      toast.success("Terhapus");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus");
    }
  };

  return (
    <AccordionItem
      title={title}
      subtitle={loading ? "Memuat..." : `${list.length} personil terdaftar`}
      icon={Icon}
      defaultOpen={defaultOpen}
      actions={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setForm({
              kind,
              order: Date.now(),
              visible: true,
              sourceType: "drive",
            });
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      }
    >
      <div className="space-y-3 pt-2">
        {list.length === 0 ? (
          <p className="text-xs sm:text-sm italic text-muted-foreground py-2">
            Belum ada data personil.
          </p>
        ) : (
          <div className="space-y-2">
            {list.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2.5 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    {p.photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={resolveImageUrl(p.photoUrl)}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold">
                        N/A
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {p.name}
                      </span>
                      {!p.visible && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          Sembunyi
                        </span>
                      )}
                    </div>
                    {p.role && (
                      <p className="text-xs text-muted-foreground truncate">
                        {p.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center bg-background rounded-lg border border-border p-0.5">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 sm:p-1.5 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
                      title="Urutkan Ke Atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={idx === list.length - 1}
                      className="p-1 sm:p-1.5 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
                      title="Urutkan Ke Bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setForm({ ...p })}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-secondary transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => del(p)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {form && (
        <PersonnelForm
          initial={form}
          onClose={() => setForm(null)}
          onSaved={onRefresh}
        />
      )}
    </AccordionItem>
  );
}

// ---------- Main Tab Component ----------
export function AdminSejarahTab() {
  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex items-start gap-3 pb-2 border-b border-border/50">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <History className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="font-bold text-base sm:text-xl text-foreground">
            Kelola Halaman Sejarah & Profil
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Buka accordion di bawah untuk mengedit masing-masing komponen.
            Perubahan langsung diperbarui secara realtime.
          </p>
        </div>
      </div>

      {/* Accordion Group */}
      <div className="space-y-3.5">
        <SectionEditor
          keyName="sejarah"
          fallbackTitle="Sejarah Berdirinya"
          icon={History}
          defaultOpen={true}
        />

        <SectionEditor
          keyName="visi"
          fallbackTitle="Visi & Misi"
          icon={Target}
          withMisi
        />

        <PersonnelSection
          kind="masyayikh"
          title="Dewan Masyayikh & Pimpinan"
          icon={BookOpen}
        />

        <PersonnelSection
          kind="pengurus"
          title="Struktur Kepengurusan"
          icon={UsersIcon}
        />
      </div>
    </div>
  );
}

export default AdminSejarahTab;
