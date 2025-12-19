# Management System — Demo Application

This repository contains a demonstration management system used for an academic project. It provides a Node.js/Express backend that interacts with an Oracle 11g XE database (PL/SQL packages and triggers) and a React frontend for managing articles, orders, and deliveries.

## Project structure

```
systeme-gestion/
├── backend/                 # Node.js + Express API
│   ├── config/              # Oracle configuration
│   ├── routes/              # API routes
│   ├── package.json
│   └── server.js
└── frontend-react/          # React application
    ├── src/
    │   ├── components/     # UI components
    │   ├── Pages/          # App pages
    │   ├── services/       # API client code
    │   └── App.jsx
    └── package.json
```

## Technologies

- Backend: Node.js (v18+), Express, oracledb, dotenv
- Frontend: React (v18), React Router, MUI, Axios
- Database: Oracle 11g XE, PL/SQL packages and triggers

## Key features

- Article management (`pkg_gestion_articles`): create, search, delete, stock validation
- Order management (`pkg_gestion_commandes`): create, state workflow (EC → PR → LI → SO), cancel, search
- Delivery management (`pkg_gestion_livraisons`): schedule deliveries, daily limits, date validation
- Server-side PL/SQL packages and triggers enforce business rules and constraints

## Installation and setup

### Prerequisites

- Oracle Database 11g XE
- Node.js 18+ and npm
- Optional: SQL Developer, Git

### 1. Clone the project

```bash
git clone <your-repository>
cd systeme-gestion
```

### 2. Configure the database

Connect to Oracle:

```sql
sqlplus <USERNAME>/<PASSWORD>@localhost:1521/xe
```

Run the main SQL script (example):

```sql
@system2.sql
```

Verify PL/SQL packages:

```sql
SELECT object_name, object_type, status
FROM user_objects
WHERE object_type IN ('PACKAGE', 'PACKAGE BODY')
ORDER BY object_name;
```

### 3. Configure the backend

```bash
cd backend
npm install
```

Edit `backend/config/database.js` and set your DB credentials:

```js
const dbConfig = {
  user: "<USERNAME>",
  password: "<PASSWORD>",
  connectString: "localhost:1521/xe"
};

module.exports = dbConfig;
```

### 4. Run the frontend (development)

```bash
cd frontend-react
npm install
npm start
```

Note about ports: the React dev server tries to use port `3000` by default. If port `3000` is already in use by the backend, React will automatically select the next available port (for example `3001`). The frontend's `package.json` proxy setting forwards API requests to `http://localhost:3000`.

## Running the application

Backend (API):

```bash
cd backend
npm start
```

API base URL: `http://localhost:3000`

Frontend (development):

```bash
cd frontend-react
npm start
```

Frontend URL: `http://localhost:3000` (or `http://localhost:3001` if React selected a different port)

## API endpoints (examples)

```
GET    /api/articles/test
POST   /api/articles/ajouter
GET    /api/articles/chercher
DELETE /api/articles/supprimer/:id

POST   /api/commandes/ajouter
PUT    /api/commandes/modifier-etat
GET    /api/commandes/chercher

POST   /api/livraisons/ajouter
GET    /api/livraisons/chercher
```

## Demo flow

1. Create an article
2. Create an order and add order lines
3. Transition the order state through EC → PR → LI → SO
4. Schedule deliveries and test daily limits
5. Observe Oracle errors surfaced in the frontend when constraints are violated

## Main database tables (examples)

- ARTICLES
- CLIENTS
- COMMANDES
- LIGNES_DE_COMMANDE
- LIVRAISONCOM
- PERSONNEL
- POSTES
- HCOMMANDESANNULEES

## Notes and future improvements

- The backend enforces several business rules, but some checks are suggested to be added at the PL/SQL package level for stronger data integrity (e.g., preventing PR transition when an order has no order lines).
- Possible improvements: authentication, analytics dashboard, real-time notifications, automated tests.

## Support

If you need help running the project, open an issue or contact me.

