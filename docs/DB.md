# Schéma base de données — RugbyCoach RCACP 95

## Diagramme ER

```mermaid
erDiagram
    profiles {
        uuid id PK
        text name
        text role "coach | player"
        timestamp created_at
    }

    joueurs {
        int id PK
        text prenom
        text nom
        int numero
        text poste
        int poids
        int taille
        boolean disponible
        boolean capitaine
        boolean archive
        text saison
        uuid auth_user_id FK
        text email_invite
    }

    matchs {
        int id PK
        text adversaire
        date date_match
        text lieu "domicile | exterieur"
        text competition
        text statut "a_venir | joue"
        int score_nous
        int score_eux
        text rapport
    }

    stats_match {
        int id PK
        int joueur_id FK
        int match_id FK
        int minutes_jouees
        int essais
        int transformations
        int passes_decisives
        int plaquages_reussis
        int plaquages_manques
        int metres_parcourus
        boolean carton_jaune
        boolean carton_rouge
        int note_etoiles
        text appreciation
    }

    evaluations {
        uuid id PK
        int joueur_id FK
        int match_id FK
        date date_eval
        uuid coach_id FK
        text porteur_balle "A|B|C|D"
        text passes "A|B|C|D"
        text plaquage "A|B|C|D"
        text endurance "A|B|C|D"
        text leadership "A|B|C|D"
        text commentaire
    }

    sante {
        int id PK
        int joueur_id FK
        text type_blessure
        text statut "out | incertain | fit"
        date date_debut
        date date_retour_estime
        text notes_medicales
        boolean resolved
    }

    seances {
        int id PK
        text titre
        date date_seance
        int duree_minutes
        text type_seance
        text objectif
        text notes
    }

    profiles ||--o{ joueurs : "auth_user_id"
    profiles ||--o{ evaluations : "coach_id"
    joueurs ||--o{ stats_match : "joueur_id"
    joueurs ||--o{ evaluations : "joueur_id"
    joueurs ||--o{ sante : "joueur_id"
    matchs ||--o{ stats_match : "match_id"
    matchs ||--o{ evaluations : "match_id"
```

## Description des tables

| Table | Rôle | Lignes estimées |
|-------|------|-----------------|
| `profiles` | Profils utilisateurs (coach + joueurs) | < 30 |
| `joueurs` | Effectif du club (actifs + archivés) | 20-50 |
| `matchs` | Calendrier des matchs | 20-40/saison |
| `stats_match` | Stats individuelles par match | 300-600/saison |
| `evaluations` | Notes A/B/C/D sur 22 compétences | 400-800/saison |
| `sante` | Historique des blessures | 10-50/saison |
| `seances` | Séances d'entraînement planifiées | 50-100/saison |

## Indexes

| Index | Table | Colonne(s) | Justification |
|-------|-------|-----------|---------------|
| `idx_joueurs_archive` | joueurs | archive | Filtre principal (actifs vs archivés) |
| `idx_joueurs_auth_user` | joueurs | auth_user_id | Lookup joueur depuis user Supabase |
| `idx_matchs_statut` | matchs | statut | Filtre à_venir/joué |
| `idx_matchs_date` | matchs | date_match DESC | Tri chronologique |
| `idx_stats_match_joueur` | stats_match | joueur_id | JOIN avec joueurs |
| `idx_stats_match_match` | stats_match | match_id | JOIN avec matchs |
| `idx_evaluations_joueur` | evaluations | joueur_id | Historique par joueur |
| `idx_evaluations_match` | evaluations | match_id | Évals d'un match |
| `idx_sante_resolved` | sante | resolved | Filtre blessures actives |

## RLS (Row Level Security)

Toutes les tables ont RLS activé. Règle générale :
- **Coach** (`profiles.role = 'coach'`) → accès total (SELECT/INSERT/UPDATE/DELETE)
- **Joueur** → SELECT uniquement sur ses propres données (via `auth_user_id`)
- **matchs et seances** → SELECT pour tous les utilisateurs authentifiés
