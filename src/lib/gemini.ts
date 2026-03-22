import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface RoomAnalysis {
  type: 'kitchen' | 'bathroom' | 'bedroom' | 'living_room' | 'other';
  condition: 'poor' | 'average' | 'good' | 'excellent';
  defects: string[];
  potential: string;
  estimatedValue: number;
}

export interface Improvement {
  id: string;
  title: string;
  description: string;
  category: 'cosmetic' | 'functional' | 'structural' | 'energy';
  costEstimate: { min: number; max: number };
  valueImpact: { min: number; max: number };
  roi: number;
  timeEstimate: string;
  priority: 'high' | 'medium' | 'low';
  justification: string;
}

export async function analyzePhotos(photos: File[]): Promise<{
  rooms: RoomAnalysis[];
  improvements: Improvement[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Convert photos to base64
  const photosData = await Promise.all(
    photos.map(async (photo) => {
      const arrayBuffer = await photo.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      return {
        inlineData: {
          mimeType: photo.type,
          data: base64,
        },
      };
    })
  );

  const prompt = `
Tu es un expert immobilier spécialisé en analyse de biens et optimisation de valeur.

Analyse ces ${photos.length} photos d'un bien immobilier.

**Tâche 1 : Analyse par pièce**
Pour chaque pièce identifiée, détermine :
- Type de pièce (kitchen/bathroom/bedroom/living_room/other)
- État général (poor/average/good/excellent)
- Défauts visibles (liste)
- Potentiel d'amélioration (phrase courte)
- Estimation valeur actuelle de la pièce (€)

**Tâche 2 : Recommandations améliorations**
Génère top 10 améliorations priorisées par ROI.

Pour chaque amélioration :
- ID unique (kebab-case)
- Titre (court, actionnable)
- Description (2-3 phrases)
- Catégorie (cosmetic/functional/structural/energy)
- Coût estimé min-max (€)
- Impact valeur min-max (€)
- ROI calculé (%)
- Temps estimé (ex: "2-3 semaines")
- Priorité (high/medium/low)
- Justification (pourquoi pertinent ici, 1-2 phrases)

**Format de sortie strict JSON** :
\`\`\`json
{
  "rooms": [
    {
      "type": "kitchen",
      "condition": "poor",
      "defects": ["Meubles vétustes", "Électroménager ancien"],
      "potential": "Fort potentiel de valorisation avec rénovation complète",
      "estimatedValue": 5000
    }
  ],
  "improvements": [
    {
      "id": "kitchen-full-reno",
      "title": "Rénovation cuisine complète",
      "description": "Remplacement meubles, électroménager, plan de travail et crédence moderne",
      "category": "cosmetic",
      "costEstimate": { "min": 8000, "max": 15000 },
      "valueImpact": { "min": 12000, "max": 20000 },
      "roi": 140,
      "timeEstimate": "2-3 semaines",
      "priority": "high",
      "justification": "Cuisine actuelle très datée, rénovation = ROI élevé pour vente ou location"
    }
  ]
}
\`\`\`

Analyse maintenant les photos ci-dessous.
`;

  const result = await model.generateContent([
    { text: prompt },
    ...photosData,
  ]);

  const response = result.response.text();
  
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                     response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Failed to parse Gemini response');
  }

  const data = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return data;
}
