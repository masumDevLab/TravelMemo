'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Globe2, Heart, MapPinned, Plus, Search, Sparkles, Trash2, UserRound, LockKeyhole } from 'lucide-react';

type Memory = {
  id: string;
  title: string;
  country: string;
  city: string;
  date: string;
  notes: string;
  favorite: boolean;
  image: string;
};

const starterMemories: Memory[] = [
  {
    id: '1',
    title: 'Sunrise in Kyoto',
    country: 'Japan',
    city: 'Kyoto',
    date: '2025-04-08',
    notes: 'A quiet walk through temple lanes, espresso at a local café, and an evening full of lanterns.',
    favorite: true,
    image: '🌅',
  },
  {
    id: '2',
    title: 'Coastal Escape',
    country: 'Portugal',
    city: 'Lisbon',
    date: '2025-05-16',
    notes: 'Tram rides, tiled streets, and the most vibrant sunset view from the riverfront.',
    favorite: false,
    image: '🌊',
  },
];

const defaultDraft = {
  title: '',
  country: '',
  city: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function TravelApp() {
  const [initialized, setInitialized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [draft, setDraft] = useState(defaultDraft);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState('');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('travelmemo-user');
    const storedSetup = localStorage.getItem('travelmemo-setup');
    const storedMemories = localStorage.getItem('travelmemo-memories');

    if (storedMemories) {
      setMemories(JSON.parse(storedMemories));
    } else {
      setMemories(starterMemories);
    }

    if (storedSetup === 'done') {
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser).username);
      }
    } else {
      setIsSetupMode(true);
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem('travelmemo-memories', JSON.stringify(memories));
    }
  }, [memories, initialized]);

  const filteredMemories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return memories;
    return memories.filter((memory) =>
      [memory.title, memory.country, memory.city, memory.notes].some((value) => value.toLowerCase().includes(query)),
    );
  }, [memories, search]);

  const stats = useMemo(() => {
    const favoriteCount = memories.filter((memory) => memory.favorite).length;
    return {
      total: memories.length,
      favoriteCount,
      countries: new Set(memories.map((memory) => memory.country)).size,
    };
  }, [memories]);

  const handleSetup = () => {
    const cleanUser = username.trim();
    const cleanPassword = password.trim();
    if (!cleanUser || !cleanPassword) return;

    localStorage.setItem('travelmemo-user', JSON.stringify({ username: cleanUser, password: cleanPassword }));
    localStorage.setItem('travelmemo-setup', 'done');
    setCurrentUser(cleanUser);
    setIsSetupMode(false);
    setPassword('');
  };

  const handleLogin = () => {
    const storedUser = localStorage.getItem('travelmemo-user');
    if (!storedUser) {
      setIsSetupMode(true);
      return;
    }

    const parsed = JSON.parse(storedUser);
    if (parsed.username === username.trim() && parsed.password === password.trim()) {
      setCurrentUser(parsed.username);
      setPassword('');
      setIsSetupMode(false);
      return;
    }

    alert('Username or password is incorrect.');
  };

  const handleAddMemory = () => {
    const cleanTitle = draft.title.trim();
    const cleanCountry = draft.country.trim();
    const cleanCity = draft.city.trim();
    if (!cleanTitle || !cleanCountry || !cleanCity || !draft.date) return;

    const memory: Memory = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      country: cleanCountry,
      city: cleanCity,
      date: draft.date,
      notes: draft.notes.trim() || 'A beautiful moment worth remembering.',
      favorite: false,
      image: ['📍', '🏞️', '🌄', '🧭', '🏙️'][Math.floor(Math.random() * 5)],
    };

    setMemories((existing) => [memory, ...existing]);
    setDraft(defaultDraft);
  };

  const toggleFavorite = (id: string) => {
    setMemories((existing) => existing.map((memory) => memory.id === id ? { ...memory, favorite: !memory.favorite } : memory));
  };

  const deleteMemory = (id: string) => {
    setMemories((existing) => existing.filter((memory) => memory.id !== id));
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), memories }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'travelmemo-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const generateShareLink = () => {
    const link = `https://travelmemo.local/share/${crypto.randomUUID().slice(0, 8)}`;
    setShareLink(link);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsSetupMode(false);
  };

  if (!initialized) {
    return <div className="auth-container"><div className="auth-card">Loading TravelMemo…</div></div>;
  }

  if (!currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-mark" style={{ marginBottom: 14, width: 52, height: 52 }}>
              <span style={{ fontSize: 22 }}>✈️</span>
            </div>
            <h1>{isSetupMode ? 'Create your account' : 'Welcome back'}</h1>
            <p>{isSetupMode ? 'Set up a private journal for your trips and memories.' : 'Log in to access your itinerary and travel notes.'}</p>
          </div>

          <div className="form-grid">
            <label className="field-label">
              Username
              <input className="input" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="travelista" />
            </label>
            <label className="field-label">
              Password
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
            <button className="button" onClick={isSetupMode ? handleSetup : handleLogin}>
              {isSetupMode ? 'Set up account' : 'Login'}
            </button>
            <button className="ghost-button" onClick={() => setIsSetupMode((value) => !value)}>
              {isSetupMode ? 'I already have an account' : 'Create account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">✈️</div>
          <span>TravelMemo</span>
        </div>

        <div className="topbar-actions">
          <button className="ghost-button" onClick={exportBackup}><Download size={16} /> Backup</button>
          <button className="button" onClick={generateShareLink}><Sparkles size={16} /> Share</button>
          <button className="danger-button" onClick={logout}><UserRound size={16} /> {currentUser}</button>
        </div>
      </header>

      <section className="hero">
        <div className="card hero-card">
          <div className="hero-header">
            <div>
              <div className="user-chip"><MapPinned size={14} /> {currentUser}</div>
            </div>
            <button className="pill ghost-button"><CalendarDays size={15} /> This year</button>
          </div>

          <h1 className="hero-title">Capture the moments worth keeping.</h1>
          <p className="hero-subtitle">
            Your private travel dashboard is ready. Store favourite memories, review your route, and keep each journey beautifully documented in one place.
          </p>

          <div className="mini-stats">
            <div className="stat-box">
              <span>Memories</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat-box">
              <span>Favorites</span>
              <strong>{stats.favoriteCount}</strong>
            </div>
            <div className="stat-box">
              <span>Countries</span>
              <strong>{stats.countries}</strong>
            </div>
          </div>
        </div>

        <aside className="card welcome-card">
          <div>
            <div className="user-chip"><LockKeyhole size={14} /> Private journal</div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>Next stop</h3>
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>
              Keep your memories secure and beautifully organized — wherever your next adventure begins.
            </p>
          </div>
        </aside>
      </section>

      <section className="dashboard-grid">
        <div className="card panel">
          <div className="panel-header">
            <h3>Journal timeline</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} color="#475569" />
              <input
                className="input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search memories"
                style={{ minWidth: 180 }}
              />
            </div>
          </div>

          {filteredMemories.length === 0 ? (
            <div className="empty-state">No memories match your current search. Add a new place to begin.</div>
          ) : (
            <div className="memory-list">
              {filteredMemories.map((memory) => (
                <article className="memory-item" key={memory.id}>
                  <div className="memory-thumb">{memory.image}</div>
                  <div className="memory-body">
                    <h4>{memory.title}</h4>
                    <div className="meta-line">
                      <span>{memory.country}</span>
                      <span>•</span>
                      <span>{memory.city}</span>
                      <span>•</span>
                      <span>{memory.date}</span>
                    </div>
                    <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: 1.6 }}>{memory.notes}</p>
                  </div>
                  <div className="memory-actions">
                    <button className="icon-button" onClick={() => toggleFavorite(memory.id)} title="Toggle favorite" aria-label="Toggle favorite">
                      <Heart size={16} fill={memory.favorite ? '#ef4444' : 'none'} color={memory.favorite ? '#ef4444' : '#475569'} />
                    </button>
                    <button className="icon-button" onClick={() => deleteMemory(memory.id)} title="Delete memory" aria-label="Delete memory">
                      <Trash2 size={16} color="#b91c1c" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="sidebar-stack">
          <div className="card panel">
            <div className="panel-header">
              <h3>Add a memory</h3>
              <Plus size={18} color="#2563eb" />
            </div>

            <div className="form-grid">
              <label className="field-label">
                Title
                <input className="input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Hidden rooftop dinner" />
              </label>

              <div className="form-row">
                <label className="field-label">
                  Country
                  <input className="input" value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} placeholder="Italy" />
                </label>
                <label className="field-label">
                  City
                  <input className="input" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} placeholder="Rome" />
                </label>
              </div>

              <label className="field-label">
                Date
                <input className="input" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
              </label>

              <label className="field-label">
                Notes
                <textarea className="textarea" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="What made the moment memorable?" />
              </label>

              <button className="button" onClick={handleAddMemory}>Save memory</button>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-header">
              <h3>Travel snapshot</h3>
              <Globe2 size={18} color="#2563eb" />
            </div>
            <div className="meta-line" style={{ gap: 10 }}>
              <span className="meta-pill">Perspectives</span>
              <span className="meta-pill">Highlights</span>
            </div>
            <div className="share-box">
              {shareLink || 'Generate a shareable trip highlight to send to friends.'}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="button" onClick={generateShareLink}>Generate share link</button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
