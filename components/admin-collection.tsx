"use client";

import { useState } from "react";
import { ExternalLink, ImagePlus, LoaderCircle, Plus, Save, Trash2, X } from "lucide-react";

type Field = { key: string; label: string; type?: "text" | "textarea" | "url" | "number" | "checkbox"; required?: boolean };
type Row = Record<string, unknown> & { id: string };
type Props = { resource: "projects" | "templates"; title: string; intro: string; rows: Row[]; fields: Field[] };

export function AdminCollection({ resource, title, intro, rows, fields }: Props) {
  const [items, setItems] = useState(rows);
  const [current, setCurrent] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  function open(row?: Row) {
    const initial = Object.fromEntries(fields.map((field) => [field.key, field.type === "checkbox" ? false : ""]));
    setCurrent(row ? { ...row } : initial as Row);
  }
  function value(row: Row, key: string) { return row[key] ?? ""; }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current) return;
    setBusy(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = form.get(field.key);
      data[field.key] = field.type === "checkbox" ? raw === "on" : field.type === "number" ? Number(raw) : raw || null;
    }
    try {
      const response = await fetch(`/api/admin/${resource}`, {
        method: current.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(current.id ? { id: current.id, data } : data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setItems((previous) => current.id ? previous.map((item) => item.id === current.id ? result.data : item) : [result.data, ...previous]);
      setCurrent(null);
      setNotice("Saved successfully.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed.");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this item permanently?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${resource}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setItems((previous) => previous.filter((item) => item.id !== id));
      setNotice("Item deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Delete failed.");
    } finally { setBusy(false); }
  }

  async function upload(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setCurrent((previous) => previous ? { ...previous, image_url: result.url } : previous);
  }

  return <>
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div><div className="eyebrow">Studio content</div><h1 className="mt-2 text-3xl tracking-[-.04em]">{title}</h1><p className="mt-2 text-sm text-[#9294a2]">{intro}</p></div>
      <button onClick={() => open()} className="btn-primary"><Plus size={15}/> Add {resource === "projects" ? "project" : "template"}</button>
    </div>
    {notice && <div role="status" className="mt-5 rounded-lg border border-[#a78bfa33] bg-[#a78bfa0c] px-4 py-3 text-xs text-[#d8d0eb]">{notice}</div>}
    {current && <div className="admin-card mt-6">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-sm">{current.id ? "Edit" : "Add"} {resource === "projects" ? "project" : "template"}</h2><button onClick={() => setCurrent(null)} aria-label="Close form"><X size={17}/></button></div>
      <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => <label key={field.key} className={`${field.type === "textarea" ? "md:col-span-2" : ""} ${field.type === "checkbox" ? "flex items-center gap-3" : ""}`}>
          {field.type === "checkbox" ? <><input type="checkbox" name={field.key} defaultChecked={Boolean(value(current, field.key))} className="accent-[#a78bfa]"/><span className="text-xs">{field.label}</span></> : <>
            <span className="label">{field.label}</span>
            {field.type === "textarea" ? <textarea name={field.key} defaultValue={String(value(current, field.key))} className="input min-h-24" required={field.required}/> : <input name={field.key} type={field.type || "text"} defaultValue={String(value(current, field.key))} className="input" required={field.required} step={field.type === "number" ? "1" : undefined}/>}
          </>}
        </label>)}
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <label className="btn-quiet cursor-pointer"><ImagePlus size={14}/> Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { await upload(file); setNotice("Image uploaded. Save to keep the change."); } catch (error) { setNotice(error instanceof Error ? error.message : "Upload failed."); } finally { setBusy(false); } }}/></label>
          {Boolean(current.image_url) && <a className="text-xs text-[#a78bfa]" href={String(current.image_url)} target="_blank" rel="noreferrer">Image uploaded <ExternalLink size={11} className="inline"/></a>}
          <span className="flex-1"/><button type="button" className="btn-quiet" onClick={() => setCurrent(null)}>Cancel</button><button disabled={busy} className="btn-primary"><Save size={14}/>{busy ? <LoaderCircle size={13} className="animate-spin"/> : "Save changes"}</button>
        </div>
      </form>
    </div>}
    {items.length ? <div className="admin-card mt-6 overflow-x-auto p-2"><table className="table"><thead><tr>{["Name", "Category", "Visibility", "", ""].map((heading, index) => <th key={index}>{heading}</th>)}</tr></thead><tbody>
      {items.map((item) => <tr key={item.id}><td><div>{String(item.title || item.name)}</div><div className="mt-1 max-w-[300px] truncate text-[10px] text-[#828494]">{String(item.description)}</div></td><td><span className="pill">{String(item.category)}</span></td><td>{Boolean(item.published) ? <span className="text-[#80dfbd]">Published</span> : <span className="text-[#9698a5]">Draft</span>}</td><td><button onClick={() => open(item)} className="text-xs text-[#c5b4ff] hover:text-white">Edit</button></td><td><button disabled={busy} onClick={() => remove(item.id)} aria-label="Delete item" className="text-[#e38c9c] hover:text-red-300"><Trash2 size={15}/></button></td></tr>)}
    </tbody></table></div> : !current && <div className="admin-card mt-6 py-12 text-center"><div className="text-sm">Nothing here yet</div><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#8a8c9c]">Add your first {resource === "projects" ? "project" : "template"}. Published items appear on the public website.</p></div>}
  </>;
}
