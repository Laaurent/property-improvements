# Property Improvements — IA Analyzer

Analyse photos immobilières et génère recommandations améliorations avec ROI calculé.

## Stack

- **Frontend** : Vite + React + TypeScript
- **IA** : Gemini 2.0 Flash (vision + recommandations)
- **Deploy** : Vercel

## Setup

```bash
npm install
cp .env.example .env
# Ajoute ta Gemini API key dans .env
npm run dev
```

## Features MVP

- ✅ Upload photos (drag & drop)
- ✅ Analyse IA automatique (défauts, potentiel)
- ✅ Recommandations améliorations priorisées ROI
- ✅ Export PDF rapport

## Gemini API Key

Gratuit : https://makersuite.google.com/app/apikey

- 1500 requêtes/jour gratuit
- Context window 2M tokens
- Vision native
