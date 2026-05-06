# API Reference — RugbyCoach RCACP 95

Toutes les routes sont préfixées par `/api/v1` → `/api/`.  
Authentification requise sur tous les endpoints via cookie de session Supabase.  
Format de réponse uniforme : `{ data: T | null, error: { code, message } | null }`.

---

## Authentification

L'app utilise Supabase Auth avec des JWT stockés en cookies httpOnly.  
Le middleware `proxy.ts` vérifie le token sur chaque requête.

---

## Joueurs

### `GET /api/joueurs`
Liste tous les joueurs (actifs et archivés).

**Réponse 200**
```json
{
  "data": [
    { "id": 1, "prenom": "Baptiste", "nom": "Moreau", "numero": 1, "poste": "Pilier gauche", "disponible": true }
  ],
  "error": null
}
```

---

### `POST /api/joueurs`
Crée un joueur.

**Body (application/json)**
```json
{
  "prenom": "Thomas",
  "nom": "Dupont",
  "numero": 9,
  "poste": "Demi de mêlée",
  "poids": 80,
  "taille": 175
}
```

**Validation Zod** — poste doit être une des 11 valeurs autorisées.  
**Réponse 201** — le joueur créé.  
**Réponse 400** — `{ error: { code: "VALIDATION_ERROR", message: "...", details: { field: [...] } } }`

---

### `GET /api/joueurs/[id]`
Détail d'un joueur avec ses stats et évaluations récentes.

**Réponse 200**
```json
{
  "data": {
    "id": 8,
    "prenom": "Nicolas",
    "nom": "Thomas",
    "stats_match": [...],
    "evaluations": [...]
  }
}
```
**Réponse 404** — joueur introuvable.

---

### `PATCH /api/joueurs/[id]`
Modifie partiellement un joueur. Tous les champs sont optionnels.

**Body** — mêmes champs que POST, tous optionnels.

---

### `DELETE /api/joueurs/[id]`
Archive un joueur (soft delete — `archive: true`).

**Réponse 200** — `{ "data": { "archived": true } }`

---

## Matchs

### `GET /api/matchs`
Liste tous les matchs avec bilan calculé côté serveur.

**Query params**
| Param | Valeurs | Défaut |
|-------|---------|--------|
| `statut` | `a_venir` \| `joue` | tous |

**Réponse 200**
```json
{
  "data": {
    "matchs": [...],
    "bilan": { "V": 3, "D": 2, "N": 1, "total": 6 }
  }
}
```

---

### `POST /api/matchs`
Crée un match à venir.

**Body**
```json
{
  "adversaire": "RC Pontoise",
  "date_match": "2026-01-25",
  "lieu": "domicile",
  "competition": "Fédérale 3"
}
```
**Réponse 201** — le match créé.

---

## Évaluations

### `GET /api/evaluations?joueur_id=X`
Historique des évaluations d'un joueur.

**Réponse 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "date_eval": "2025-09-14",
      "porteur_balle": "A",
      "plaquage": "B",
      "endurance": "A",
      "commentaire": "Bon match",
      "matchs": { "adversaire": "RC Pontoise" }
    }
  ]
}
```

---

### `POST /api/evaluations`
Enregistre une évaluation A/B/C/D pour un joueur.  
Si `match_id` est fourni, remplace l'évaluation existante pour ce joueur/match.

**Body**
```json
{
  "joueur_id": 8,
  "match_id": 1,
  "porteur_balle": "A",
  "passes": "B",
  "plaquage": "A",
  "endurance": "B",
  "commentaire": "Excellent match, capitaine exemplaire."
}
```
Tous les champs de compétence sont optionnels (A/B/C/D uniquement).  
**Réponse 201** — l'évaluation créée.

---

## Dashboard

### `GET /api/dashboard`
Agrège toutes les données du tableau de bord en un seul appel (requêtes parallèles côté serveur).

**Réponse 200**
```json
{
  "data": {
    "coach": { "name": "Thomas Plantor", "role": "coach" },
    "prochain_match": { "adversaire": "Beauvais", "date_match": "2025-12-14" },
    "bilan": { "V": 3, "D": 2, "N": 1, "total": 6 },
    "effectif": { "total": 20, "disponibles": 18 },
    "infirmerie": { "out": 1, "incertain": 1 },
    "derniers_matchs": [...]
  }
}
```

---

## Santé

### `GET /api/sante`
Blessures actives (`resolved=false` par défaut).

**Query params**
| Param | Valeurs | Défaut |
|-------|---------|--------|
| `resolved` | `true` \| `false` | `false` |

---

### `POST /api/sante`
Déclare une blessure.

**Body**
```json
{
  "joueur_id": 5,
  "type_blessure": "Entorse genou gauche",
  "statut": "out",
  "date_debut": "2025-10-19",
  "date_retour_estime": "2025-12-20",
  "notes_medicales": "IRM confirmé — 6 semaines."
}
```

---

## Codes d'erreur

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Corps de requête invalide (Zod) |
| `UNAUTHORIZED` | 401 | Non authentifié |
| `FORBIDDEN` | 403 | Accès refusé |
| `NOT_FOUND` | 404 | Ressource introuvable |
| `INTERNAL_ERROR` | 500 | Erreur serveur interne |
