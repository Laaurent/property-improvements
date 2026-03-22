# Installation & Setup

## 1. Obtenir Gemini API Key (gratuit)

1. Va sur https://aistudio.google.com/apikey
2. Clique "Create API key"
3. Copie la clé

## 2. Configuration

```bash
cd property-improvements
cp .env.example .env
# Édite .env et ajoute ta clé API
```

## 3. Lancer l'app

```bash
npm run dev
```

Ouvre http://localhost:5173

## 4. Test

1. Upload 5-10 photos d'un bien (cuisine, SDB, salon, chambres)
2. Clique "Analyser avec l'IA"
3. Attend ~10-30s (selon nombre de photos)
4. Résultats : analyse pièces + top 10 améliorations ROI

## Stack

- Vite + React 18 + TypeScript
- Gemini 2.0 Flash (vision + recommandations)
- Tailwind CSS + Lucide icons
- Gratuit : 1500 req/day Gemini

## Prochaines étapes

- [ ] Export PDF rapport
- [ ] Stockage résultats (localStorage ou Supabase)
- [ ] Génération images avant/après (optionnel)
- [ ] Deploy Vercel
