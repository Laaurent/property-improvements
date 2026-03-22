import { useState } from 'react';
import { Upload, Loader2, TrendingUp, Home } from 'lucide-react';
import { analyzePhotos, type RoomAnalysis, type Improvement } from './lib/gemini';


function App() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    rooms: RoomAnalysis[];
    improvements: Improvement[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos(files);
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    setLoading(true);
    try {
      const analysis = await analyzePhotos(photos);
      setResults(analysis);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur analyse. Réessaye.');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = results?.improvements.reduce((s, i) => s + i.costEstimate.min, 0) || 0;
  const totalValue = results?.improvements.reduce((s, i) => s + i.valueImpact.min, 0) || 0;
  const globalROI = totalCost > 0 ? Math.round((totalValue / totalCost) * 100) : 0;

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Home size={28} />
          </div>
          <div className="header-text">
            <h1>Property Improvements</h1>
            <p>Analyse IA · Recommandations · ROI calculé</p>
          </div>
        </div>
      </header>

      <div className="container">
        {!results && (
          <div className="fade-in">
            <div className="hero">
              <h2>Optimise la valeur de ton bien</h2>
              <p>Upload des photos et reçois des recommandations avec ROI calculé par l'IA</p>
            </div>

            <div className="card">
              <div className="upload-zone">
                <Upload className="upload-icon" size={64} />
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  <h3>Clique pour uploader des photos</h3>
                  <p>ou glisse-dépose · 5-20 photos recommandées</p>
                </label>
                <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              {previews.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600 }}>{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
                    <button onClick={() => { setPhotos([]); setPreviews([]); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      Supprimer
                    </button>
                  </div>

                  <div className="preview-grid">
                    {previews.map((p, i) => (
                      <div key={i} className="preview-item">
                        <img src={p} alt={`${i + 1}`} />
                      </div>
                    ))}
                  </div>

                  <button onClick={handleAnalyze} disabled={loading} className="btn btn-primary">
                    {loading ? <><Loader2 size={24} className="spin" /> Analyse...</> : <><TrendingUp size={24} /> Analyser</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {results && (
          <div className="fade-in">
            <div className="stats-grid">
              <div className="stat-card stat-gray">
                <h3>Pièces</h3>
                <p>{results.rooms.length}</p>
              </div>
              <div className="stat-card stat-primary">
                <h3>Coût total</h3>
                <p>{(totalCost / 1000).toFixed(0)}k€</p>
              </div>
              <div className="stat-card stat-success">
                <h3>+Valeur</h3>
                <p>+{(totalValue / 1000).toFixed(0)}k€</p>
              </div>
              <div className="stat-card stat-warning">
                <h3>ROI</h3>
                <p>{globalROI}%</p>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '1.5rem' }}>Analyse par pièce</h2>
              <div className="rooms-grid">
                {results.rooms.map((r, i) => (
                  <div key={i} className="room-card">
                    <div className="room-header">
                      <span className="room-title">{r.type.replace('_', ' ')}</span>
                      <span className={`badge badge-${r.condition}`}>{r.condition}</span>
                    </div>
                    <p style={{ color: '#4b5563', marginBottom: '0.75rem' }}>{r.potential}</p>
                    {r.defects.map((d, j) => <p key={j} style={{ fontSize: '0.875rem', color: '#6b7280' }}>• {d}</p>)}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '1.5rem' }}>Recommandations</h2>
              <div className="improvements-list">
                {results.improvements.map((imp, idx) => (
                  <div key={imp.id} className={`improvement-card priority-${imp.priority}`}>
                    <div className="improvement-header">
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#9ca3af' }}>#{idx + 1}</span>
                        <h3 className="improvement-title">{imp.title}</h3>
                        <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>{imp.description}</p>
                      </div>
                      <span className={`badge badge-${imp.priority === 'high' ? 'poor' : imp.priority === 'medium' ? 'average' : 'good'}`}>
                        {imp.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="improvement-stats">
                      <div className="stat-box">
                        <div className="stat-label">Coût</div>
                        <div className="stat-value">{imp.costEstimate.min.toLocaleString()}-{imp.costEstimate.max.toLocaleString()}€</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">+Valeur</div>
                        <div className="stat-value" style={{ color: '#10b981' }}>+{imp.valueImpact.min.toLocaleString()}-{imp.valueImpact.max.toLocaleString()}€</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">ROI</div>
                        <div className="stat-value" style={{ color: '#2563eb' }}>{imp.roi}%</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Durée</div>
                        <div className="stat-value">{imp.timeEstimate}</div>
                      </div>
                    </div>

                    <div className="justification">💡 {imp.justification}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setResults(null); setPhotos([]); setPreviews([]); }} className="btn" style={{ background: '#f3f4f6', color: '#111827' }}>
              ← Nouvelle analyse
            </button>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
