import { useState } from 'react';
import { Upload, Loader2, TrendingUp, Home } from 'lucide-react';
import { analyzePhotos, type RoomAnalysis, type Improvement } from './lib/gemini';
import './App.css';

function App() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    rooms: RoomAnalysis[];
    improvements: Improvement[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    
    setLoading(true);
    try {
      const analysis = await analyzePhotos(photos);
      setResults(analysis);
    } catch (error) {
      console.error('Erreur analyse:', error);
      alert('Erreur lors de l\'analyse. Vérifie ta clé API Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = results?.improvements.reduce(
    (sum, imp) => sum + imp.costEstimate.min,
    0
  ) || 0;

  const totalValueImpact = results?.improvements.reduce(
    (sum, imp) => sum + imp.valueImpact.min,
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
            <Home className="w-10 h-10 text-blue-600" />
            Property Improvements
          </h1>
          <p className="text-slate-600 text-lg">
            Analyse tes photos avec l'IA et obtiens des recommandations améliorations avec ROI calculé
          </p>
        </div>

        {/* Upload Section */}
        {!results && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-slate-700">
                  Clique pour uploader des photos
                </span>
                <p className="text-sm text-slate-500 mt-2">
                  ou glisse-dépose ici (5-20 photos recommandées)
                </p>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {photos.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-slate-600 mb-3">
                  {photos.length} photo{photos.length > 1 ? 's' : ''} sélectionnée{photos.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Analyser avec l'IA
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-sm text-slate-600 mb-1">Pièces analysées</p>
                <p className="text-3xl font-bold text-slate-900">{results.rooms.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-sm text-slate-600 mb-1">Coût total min</p>
                <p className="text-3xl font-bold text-blue-600">{totalCost.toLocaleString()}€</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-sm text-slate-600 mb-1">Impact valeur min</p>
                <p className="text-3xl font-bold text-green-600">+{totalValueImpact.toLocaleString()}€</p>
              </div>
            </div>

            {/* Rooms Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Analyse par pièce</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.rooms.map((room, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-slate-900 capitalize">{room.type.replace('_', ' ')}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        room.condition === 'poor' ? 'bg-red-100 text-red-700' :
                        room.condition === 'average' ? 'bg-yellow-100 text-yellow-700' :
                        room.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {room.condition}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{room.potential}</p>
                    {room.defects.length > 0 && (
                      <ul className="text-xs text-slate-500 list-disc list-inside">
                        {room.defects.map((d, j) => <li key={j}>{d}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommandations amélioration</h2>
              <div className="space-y-4">
                {results.improvements.map((imp) => (
                  <div key={imp.id} className="border-l-4 border-blue-600 bg-slate-50 rounded-r-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{imp.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{imp.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                        imp.priority === 'high' ? 'bg-red-100 text-red-700' :
                        imp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {imp.priority}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500">Coût</p>
                        <p className="text-sm font-medium text-slate-900">
                          {imp.costEstimate.min.toLocaleString()}-{imp.costEstimate.max.toLocaleString()}€
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Impact valeur</p>
                        <p className="text-sm font-medium text-green-600">
                          +{imp.valueImpact.min.toLocaleString()}-{imp.valueImpact.max.toLocaleString()}€
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">ROI</p>
                        <p className="text-sm font-medium text-blue-600">{imp.roi}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Durée</p>
                        <p className="text-sm font-medium text-slate-900">{imp.timeEstimate}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mt-3 italic">{imp.justification}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setResults(null);
                setPhotos([]);
              }}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Nouvelle analyse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
