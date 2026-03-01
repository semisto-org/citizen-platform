# Villages Nourriciers

Plateforme citoyenne de cartographie participative pour la Belgique. Les citoyens identifient et cartographient les haies, arbres, bosquets et opportunités de plantation sur une carte interactive, puis valident les contributions des autres pour faire progresser leur village.

## Fonctionnalités

- **Carte interactive** — visualisation et ajout de spots (haies, arbres isolés, bosquets, zones potentielles) sur une carte Mapbox
- **Validation citoyenne** — chaque spot soumis est validé par la communauté (2 validations positives = spot validé)
- **Système de points et badges** — les contributions rapportent des points (soumission, validation, correction, signalement)
- **Progression par village** — score et niveau (0 à 5) calculés à partir des spots validés et plantés
- **Classement** — tableau de bord et ranking des villages participants
- **Rôles utilisateur** — visiteur, membre, planteur, parrain, ambassadeur, admin

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Ruby on Rails 8.1 (API-only) |
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| Base de données | PostgreSQL |
| Cartographie | Mapbox GL JS |
| Authentification | JWT |
| Déploiement | Kamal |

## Prérequis

- Ruby 3.3
- Node.js (v20+)
- PostgreSQL

## Installation

```bash
# Cloner le dépôt
git clone <url> && cd citizen-platform

# Backend
bundle install
bin/rails db:create db:migrate db:seed

# Frontend
cd frontend && npm install
cp .env.example .env   # Renseigner VITE_MAPBOX_TOKEN
```

## Lancer en développement

```bash
bin/dev
```

Cela démarre le serveur Rails sur `localhost:3000` et le serveur Vite sur `localhost:5173`.

## Données de démonstration

Le seed crée :
- 3 régions (Wallonie, Flandre, Bruxelles-Capitale)
- 10 villages pilotes en Wallonie (Modave, Ohey, Gesves, Assesse, etc.)
- 3 badges (Explorateur, Cartographe, Photographe)
- Un compte admin (`admin@villages-nourriciers.be` / `password123`)
- Des utilisateurs et spots de démonstration

## API

Toutes les routes sont sous `/api/v1/`. Points d'entrée principaux :

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Inscription |
| POST | `/api/v1/auth/login` | Connexion (retourne un JWT) |
| GET | `/api/v1/auth/me` | Profil connecté |
| GET | `/api/v1/villages` | Liste des villages |
| GET | `/api/v1/villages/:id` | Détail d'un village |
| GET | `/api/v1/villages-ranking` | Classement des villages |
| GET | `/api/v1/spots` | Liste des spots |
| POST | `/api/v1/spots` | Créer un spot |
| POST | `/api/v1/spots/:id/submit` | Soumettre un brouillon |
| POST | `/api/v1/spots/:id/validate` | Valider un spot |
| GET | `/api/v1/spots-geojson` | Spots au format GeoJSON |
| GET | `/api/v1/dashboard/global` | Statistiques globales |

## Qualité

```bash
bin/rubocop          # Lint Ruby
bin/brakeman         # Analyse de sécurité
bin/bundler-audit    # Audit des dépendances
bin/ci               # Tout en une commande
```

## Licence

Propriétaire — Tous droits réservés.
