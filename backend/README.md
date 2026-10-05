# Shop Mada Analytics API

API REST Spring Boot pour le tableau de bord e-commerce Shop Mada. Les montants sont stockés en ariary (MGA), et les réponses sont exposées sous `/api/v1`.

## Prérequis

- Java 21
- Maven 3.9+
- Docker Compose, ou PostgreSQL 16 accessible sur `localhost:5432`

## Démarrage local

```bash
docker compose up -d postgres
mvn spring-boot:run
```

La base `shop_mada` est initialisée automatiquement et reçoit des données de démonstration au premier démarrage. Les données de démonstration sont désactivées avec le profil Spring `production`.

Les paramètres de connexion et l'origine CORS du frontend sont configurables avec les variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` et `FRONTEND_ORIGIN`.

## Endpoints

| Méthode | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/dashboard/summary?from=2026-01-01&to=2026-01-31` | Indicateurs clés et évolution du chiffre d'affaires |
| GET | `/api/v1/dashboard/revenue` | Série quotidienne du chiffre d'affaires |
| GET | `/api/v1/dashboard/top-products` | Produits les plus vendus |
| GET | `/api/v1/dashboard/sales-by-region` | Ventes par région |
| GET | `/api/v1/dashboard/sales-by-category` | Ventes par catégorie |
| GET | `/api/v1/reports/revenue?year=2026` | Série mensuelle pour une année |
| GET/POST | `/api/v1/customers` | Liste paginée/recherche et création de clients |
| GET/PUT/DELETE | `/api/v1/customers/{id}` | Lecture, modification et suppression d'un client |
| GET/POST | `/api/v1/products` | Liste paginée/recherche et création de produits |
| GET/PUT/DELETE | `/api/v1/products/{id}` | Lecture, modification et suppression d'un produit |
| GET/POST | `/api/v1/orders` | Liste paginée/filtrée et création d'une commande |
| GET | `/api/v1/orders/{id}` | Détail d'une commande |
| PATCH | `/api/v1/orders/{id}/status` | Changement de statut |
| GET | `/actuator/health` | État de santé du service |

La pagination accepte `page` (à partir de zéro) et `size` (maximum 100). Les filtres analytiques acceptent `from` et `to` au format ISO `YYYY-MM-DD`; la période par défaut couvre les 30 derniers jours.

Exemple de création de commande :

```json
{
  "customerId": 1,
  "channel": "WEBSITE",
  "paymentMethod": "Mobile Money",
  "items": [{ "productId": 1, "quantity": 2 }]
}
```

## Vérifications

```bash
mvn test
```