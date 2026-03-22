import { useState } from 'react';
import { Upload, Loader2, TrendingUp, Home, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { analyzePhotos, type RoomAnalysis, type Improvement } from './lib/gemini';
import './App.css';

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
      
      // Generate previews
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
      console.error('Erreur analyse:', error);
      alert('Erreur lors de l\'analyse. Vérifie ta connexion et réessaye.');
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

  const globalROI = totalCost > 0 ? Math.round((totalValueImpact / totalCost) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Property Improvements
              </h1>
              <p className="text-sm text-gray-600">Analyse IA · Recommandations personnalisées · ROI calculé</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Upload Section */}
        {!results && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Optimise la valeur de ton bien
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload des photos et reçois des recommandations d'améliorations avec ROI calculé par l'IA
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group">
                <Upload className="w-16 h-16 text-gray-400 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Clique pour uploader des photos
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    ou glisse-dépose ici · 5-20 photos recommandées
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WEBP · Max 10MB par photo
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

              {previews.length > 0 && (
                <div className="mt-8 animate-slideUp">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      {photos.length} photo{photos.length > 1 ? 's' : ''} sélectionnée{photos.length > 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => {
                        setPhotos([]);
                        setPreviews([]);
                      }}
                      className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Supprimer tout
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                    {previews.map((preview, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img 
                          src={preview} 
                          alt={`Preview ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-6 h-6" />
                        Analyser avec l'IA
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-600 mb-1 font-medium">Pièces analysées</p>
                <p className="text-4xl font-bold text-gray-900">{results.rooms.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-sm text-blue-100 mb-1 font-medium">Coût total estimé</p>
                <p className="text-4xl font-bold">{(totalCost / 1000).toFixed(0)}k€</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-sm text-green-100 mb-1 font-medium">Impact valeur</p>
                <p className="text-4xl font-bold">+{(totalValueImpact / 1000).toFixed(0)}k€</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-sm text-purple-100 mb-1 font-medium">ROI global</p>
                <p className="text-4xl font-bold">{globalROI}%</p>
              </div>
            </div>

            {/* Rooms Analysis */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
                Analyse par pièce
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.rooms.map((room, i) => (
                  <div 
                    key={i} 
                    className="border-2 border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-lg text-gray-900 capitalize group-hover:text-blue-600 transition-colors">
                        {room.type.replace('_', ' ')}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        room.condition === 'poor' ? 'bg-red-100 text-red-700' :
                        room.condition === 'average' ? 'bg-yellow-100 text-yellow-700' :
                        room.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {room.condition}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{room.potential}</p>
                    {room.defects.length > 0 && (
                      <div className="space-y-1.5">
                        {room.defects.map((d, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-gray-600">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-blue-600" />
                Recommandations prioritaires
              </h2>
              <div className="space-y-4">
                {results.improvements.map((imp, idx) => (
                  <div 
                    key={imp.id} 
                    className="border-l-4 bg-gradient-to-r from-gray-50 to-white rounded-r-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                    style={{
                      borderColor: imp.priority === 'high' ? '#ef4444' : 
                                   imp.priority === 'medium' ? '#f59e0b' : '#6b7280'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {imp.title}
                          </h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{imp.description}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ml-4 ${
                        imp.priority === 'high' ? 'bg-red-100 text-red-700' :
                        imp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {imp.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Coût</p>
                        <p className="text-lg font-bold text-gray-900">
                          {imp.costEstimate.min.toLocaleString()}-{imp.costEstimate.max.toLocaleString()}€
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <p className="text-xs text-green-700 mb-1 font-medium">+Valeur</p>
                        <p className="text-lg font-bold text-green-700">
                          +{imp.valueImpact.min.toLocaleString()}-{imp.valueImpact.max.toLocaleString()}€
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-xs text-blue-700 mb-1 font-medium">ROI</p>
                        <p className="text-lg font-bold text-blue-700">{imp.roi}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Durée</p>
                        <p className="text-lg font-bold text-gray-900">{imp.timeEstimate}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        💡 {imp.justification}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setResults(null);
                setPhotos([]);
                setPreviews([]);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow hover:shadow-lg"
            >
              ← Nouvelle analyse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
// Force rebuild
