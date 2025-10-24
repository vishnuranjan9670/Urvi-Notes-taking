import React, { useState, useEffect } from "react";

export default function UrviNotesTaking() {
  const [raw, setRaw] = useState("");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("general");

  const SUBJECTS = ["general", "physics", "chemistry", "math", "history", "social"];

  const CATEGORY_EMOJIS = {
    general: "📌",
    physics: "📚",
    chemistry: "⚗️",
    math: "🧮",
    history: "🏰",
    social: "🏛️"
  };

  // Subject-specific keywords
  const SUBJECT_KEYWORDS = {
    physics: ["force", "acceleration", "mass", "energy", "motion", "velocity", "gravity"],
    chemistry: ["reaction", "compound", "element", "molecule", "acid", "base", "solution"],
    math: ["formula", "equation", "number", "sum", "function", "variable", "geometry"],
    history: ["king", "battle", "treaty", "empire", "colonial", "revolution", "dynasty"],
    social: ["government", "law", "economy", "policy", "society", "constitution", "rights"],
    general: []
  };

  // Process note
  function createNote() {
    if (!raw.trim()) return;

    const html = formatText(raw, subject);
    const newNote = {
      id: Date.now(),
      title: title || (raw.split("\n")[0].slice(0, 60) || "Untitled"),
      raw,
      html,
      subject,
      emoji: CATEGORY_EMOJIS[subject],
      createdAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    setRaw("");
    setTitle("");
  }

  // Delete note
  function deleteNote(id) {
    setNotes(notes.filter(n => n.id !== id));
  }

  // Copy note
  function copyNoteText(note) {
    navigator.clipboard.writeText(note.raw).then(() => {
      alert("✅ Note copied to clipboard!");
    });
  }

  // Print note
  function printNote(note) {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>${note.title}</title></head><body>`);
    win.document.write(`<h2>${note.emoji} ${note.title}</h2>`);
    win.document.write(note.html);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
  }

  // Export note as JSON
  function exportNoteJSON(note) {
    const blob = new Blob([JSON.stringify(note, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 text-white">
      <h1 className="text-5xl font-extrabold mb-6 text-center">✨ Urvi Notes-Taking</h1>

      <div className="bg-slate-800 p-6 rounded-2xl mb-6">
        <input
          type="text"
          placeholder="Note Title (Optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-slate-900 text-white"
        />
        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="Write or paste your note here..."
          className="w-full h-40 p-3 mb-4 rounded-lg bg-slate-900 text-white resize-none"
        />
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-slate-900 text-white"
        >
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
        <button
          onClick={createNote}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-all"
        >
          ✨ Make Beautiful Note
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold mb-2">{note.emoji} {note.title}</h3>
            <div className="text-sm mb-2" dangerouslySetInnerHTML={{ __html: note.html }} />
            <p className="text-xs mb-2">Subject: {note.subject.toUpperCase()}</p>
            <div className="flex gap-2">
              <button onClick={() => copyNoteText(note)} className="bg-blue-600 px-2 py-1 rounded">📋 Copy</button>
              <button onClick={() => printNote(note)} className="bg-green-600 px-2 py-1 rounded">🖨️ Print</button>
              <button onClick={() => exportNoteJSON(note)} className="bg-indigo-600 px-2 py-1 rounded">💾 Export</button>
              <button onClick={() => deleteNote(note.id)} className="bg-red-600 px-2 py-1 rounded">🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ======== Helper Functions ========

  function formatText(text, subject) {
    const lines = text.split('\n').map(l => l.trim());
    const formatted = [];
    const keywords = SUBJECT_KEYWORDS[subject.toLowerCase()] || [];
    let currentList = [];
    let currentListType = null;

    function flushList() {
      if (currentList.length === 0) return;
      const tag = currentListType === "number" ? "ol" : "ul";
      formatted.push(`<${tag} class="ml-6 mb-2">${currentList.join('')}</${tag}>`);
      currentList = [];
      currentListType = null;
    }

    lines.forEach(line => {
      if (!line) return;

      // Headings
      if (/^#/.test(line) || /^[A-Z\s]{5,}$/.test(line) || line.endsWith(":")) {
        flushList();
        formatted.push(`<h3 class="text-lg font-bold text-indigo-400 mt-4 mb-2">${escapeHtml(line.replace(/^#+\s*/, ''))}</h3>`);
        return;
      }

      // Bullets
      if (/^[-*•]\s+/.test(line)) {
        const content = escapeHtml(line.replace(/^[-*•]\s+/, ''));
        currentListType = "bullet";
        currentList.push(`<li class="mb-1">${highlightKeywords(content, keywords)}</li>`);
        return;
      }

      // Numbered points
      if (/^\d+\.\s+/.test(line)) {
        const content = escapeHtml(line.replace(/^\d+\.\s+/, ''));
        currentListType = "number";
        currentList.push(`<li class="mb-1">${highlightKeywords(content, keywords)}</li>`);
        return;
      }

      // Normal paragraph
      flushList();
      formatted.push(`<p class="mb-2 leading-relaxed">${highlightKeywords(escapeHtml(line), keywords)}</p>`);
    });

    flushList();
    return formatted.join("\n");
  }

  function highlightKeywords(text, keywords) {
    if (!keywords || keywords.length === 0) return text;
    keywords.forEach(word => {
      const re = new RegExp(`\\b(${escapeRegExp(word)})\\b`, "gi");
      text = text.replace(re, `<strong class="font-bold text-white">$1</strong>`);
    });
    return text;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
  
