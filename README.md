# Autopublicamos – TikTok Analytics Backend

Backend for **Autopublicamos**, a company that promotes books by women authors on TikTok.  
The team publishes videos on their own TikTok accounts, then this backend scrapes those **same public posts** and lets them analyze performance with filters and charts.

This was my **first web app**, built from scratch and currently used in production, processing around **60,000 TikTok posts per month**.

---

## 1. What it does

- Scrapes **Autopublicamos’ own public TikTok videos** using **Apify**.
- Stores posts and metrics in **Azure PostgreSQL**.
- Provides APIs so the internal dashboard can:
  - Filter by **author**
  - Filter by **book**
  - Filter by **PA** (person/account that posted the video)
  - Filter by date ranges, campaigns, etc.
- Returns structured data ready for charts and exports.

This backend is **not multi-user**; the same account that manages the scrapes is the one that explores and analyzes the data. It is an internal tool, not a shared analytics platform.

---

## 2. Codes in descriptions + Excel master data

Each TikTok video uses **codes in the description** to encode:

- Author  
- Book  
- PA (publisher / creator)  
- Scene number, campaign, etc.

The backend exposes endpoints to upload **Excel files** that maintain reference tables:

- Authors master
- Books master
- PAs master

Those Excel uploads update tables in PostgreSQL.  
When new TikTok posts are scraped, the backend **cross-references the codes** in each video with these masters to attach:

- Author name  
- Book title  
- PA identity  
- Scene/campaign metadata  

All charts and filters are built on top of this code cross-reference.

---

## 3. Backend & Azure architecture

- **Spring Boot backend (Java)** on **Azure Container Apps**
  - REST APIs for:
    - Querying TikTok posts with filters
    - Serving aggregated data for charts
    - Handling Excel uploads and updating reference tables
  - Uses **environment variables/app settings** for secrets (DB, Apify, B2C, etc.).

- **Python service** on **Azure Container Apps**
  - Connects to **Apify** with a token from env vars.
  - Triggers TikTok scraping runs for Autopublicamos’ accounts.
  - Inserts/updates posts in **Azure PostgreSQL**.

- **Azure AD B2C**
  - Used for secure login to the internal dashboard (single-tenant, private use).
  - Configuration (client IDs, secrets, etc.) stored in environment variables.

- **Azure PostgreSQL**
  - Stores TikTok posts, authors, books, PAs and code mappings.

- **Azure Storage Accounts**
  - Used for logs and supporting storage (e.g. uploaded Excel files, diagnostics).

---

## 4. Why this project matters

- It is a **real production backend** built for a client: **Autopublicamos**.
- It was my **first web app**, developed without prior web experience; everything (scraping flow, DB model, Azure integration) was the result of learning and persistence.
- Today it helps Autopublicamos understand **how their own TikTok campaigns perform** per author, book and PA, based on tens of thousands of posts per month.
