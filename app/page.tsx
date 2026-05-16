"use client";
import { useState, useEffect, useRef } from 'react';

interface Subject {
  code: string;
  name: string;
}

interface LectureCounts {
  [key: string]: number;
}

const SUBJECTS: Subject[] = [
  { code: 'CS405',  name: 'Software Eng.'    },
  { code: 'CS206',  name: 'Data Structures'  },
  { code: 'CS411',  name: 'Database Systems' },
  { code: 'MGT101', name: 'Management'       }
];

const DEFAULTS: LectureCounts = { CS405: 0, CS206: 0, CS411: 0, MGT101: 0 };

export default function Tracker() {
  const [counts, setCounts] = useState<LectureCounts | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/lectures')
      .then(res => res.json())
      .then(data => setCounts(data || DEFAULTS));
  }, []);

  // Auto-focus the input when it appears
  useEffect(() => {
    if (editingCode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCode]);

  const saveToDB = async (newCounts: LectureCounts) => {
    setIsSaving(true);
    try {
      await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counts: newCounts }),
      });
    } finally {
      setTimeout(() => setIsSaving(false), 1200);
    }
  };

  const change = (code: string, delta: number) => {
    if (!counts) return;
    const updated = { ...counts, [code]: Math.max(0, (counts[code] || 0) + delta) };
    setCounts(updated);
    saveToDB(updated);
  };

  const handleManualEdit = (code: string, newValue: string) => {
    if (!counts) return;
    const val = parseInt(newValue, 10);
    const updated = { ...counts, [code]: isNaN(val) ? 0 : Math.max(0, val) };
    setCounts(updated);
    saveToDB(updated);
    setEditingCode(null);
  };

  if (!counts) return <div className="loading">CONNECTING TO DATABASE...</div>;

  const maxVal = Math.max(...Object.values(counts), 1);

  return (
    <main>
      <header>
        <div className="header-left">
          <h1>Tracker</h1>
          <p>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </header>

      <div className="grid">
        {SUBJECTS.map((s) => (
          <div key={s.code} className="card">
            <div className="card-top">
              <span className="code-badge">{s.code}</span>
              <span className="subject-name">{s.name}</span>
            </div>
            <div className="counter-row">
              {editingCode === s.code ? (
                <input
                  ref={inputRef}
                  className="edit-input"
                  type="number"
                  defaultValue={counts[s.code]}
                  onBlur={(e) => handleManualEdit(s.code, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleManualEdit(s.code, e.currentTarget.value);
                    if (e.key === 'Escape') setEditingCode(null);
                  }}
                />
              ) : (
                <span className="val" onClick={() => setEditingCode(s.code)}>
                  {counts[s.code]}
                </span>
              )}
              
              <div className="controls">
                <button className="btn" onClick={() => change(s.code, 1)}>+</button>
                <button className="btn" onClick={() => change(s.code, -1)}>−</button>
              </div>
            </div>
            <div className="bar-wrap">
              <div className="bar-fill" style={{ width: `${(counts[s.code] / maxVal) * 100}%` }}></div>
            </div>
            <div className="card-footer">{counts[s.code]} Lectures Completed</div>
          </div>
        ))}
      </div>

      <div className={`saved-dot ${isSaving ? 'show' : ''}`}>
        SYNCING TO CLOUD
      </div>
    </main>
  );
}