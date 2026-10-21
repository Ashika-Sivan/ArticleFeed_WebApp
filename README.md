# Article Feeds Web Application

A clean, modular, and personalized Article Feeds Web Application built with **Node.js/Express MVC Backend** and **React (Vite) Frontend**, backed by **MongoDB**.

---

## 🚀 Features

- **Authentication & Security**:
  - User registration with name, email, phone, DOB, password, and initial category preferences.
  - Dual login via **either Email OR Phone** + Password.
  - JWT tokens stored in secure, **HTTP-only cookies** (`cookie-parser`).
  - Passwords hashed using `bcryptjs`.
- **Personalized Feeds (Dashboard)**:
  - Feed filtered according to the logged-in user's preferred categories.
  - Excludes articles written by the user.
  - Excludes blocked articles.
  - Category filters and real-time keyword/tag search.
  - Popup article reader modal.
- **Article Interactions**:
  - Like, Dislike, and Block articles directly from feed or modal.
- **User Settings**:
  - Edit personal information (first name, last name, phone, email, DOB).
  - Secure password update with current password validation.
  - Add or remove category preferences at any time.
- **Article Management (My Articles)**:
  - Create new articles with title, description, category, tags, and image URLs.
  - View published articles with engagement metrics (likes, dislikes, blocks count).
  - Edit and Delete articles (with ownership verification).

---

## 🏛️ Architecture & Folder Structure

This application strictly follows the **Layered MVC (Model-View-Controller)** pattern combined with the **Service-Repository Pattern** and **SOLID Object-Oriented Principles** for maximum modularity, type safety, and testability:
- **View (`client/`)**: Modern React + Vite interactive SPA with fluid UX (ESM).
- **Controller (`server/src/controllers/`)**: Handles HTTP requests, parameter extraction, and responses with TypeScript types.
- **Service (`server/src/services/`)**: Orchestrates business logic, validations, and rules.
- **Repository (`server/src/repositories/`)**: Encapsulates all database queries and persistence abstractions.
- **Model (`server/src/models/`)**: Normalized Mongoose schemas, indexes, and typed document definitions.
- **Interfaces (`server/src/interfaces/`)**: Abstract contracts enforcing Interface Segregation and Dependency Inversion.
- **Composition Root (`server/src/container.ts`)**: Dependency Injection container wiring abstractions to concrete implementations.

```
Article_Web_App/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                 # Typed MongoDB connection
│   │   ├── constants/
│   │   │   └── categories.ts         # Shared category definitions & types
│   │   ├── controllers/              # [C in MVC] HTTP controllers (Req/Res handling)
│   │   │   ├── authController.ts
│   │   │   ├── articleController.ts
│   │   │   └── userController.ts
│   │   ├── interfaces/               # [SOLID Abstractions] Contracts for DIP & ISP
│   │   │   ├── IRepository.ts        # Generic BaseRepository interfaces
│   │   │   ├── IUserRepository.ts    # Segregated IUserReader & IUserWriter
│   │   │   ├── IArticleRepository.ts # Segregated IArticleReader & IArticleWriter
│   │   │   ├── ITokenService.ts      # Token generation/verification contract
│   │   │   └── IServices.ts          # Core service contracts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts     # Cookie JWT verification with AuthRequest
│   │   │   └── errorHandler.ts       # Centralized typed error handler
│   │   ├── models/                   # [M in MVC] Normalized Mongoose schemas & indexes
│   │   │   ├── User.ts
│   │   │   └── Article.ts
│   │   ├── repositories/             # [Data Access] DB query abstraction layer
│   │   │   ├── baseRepository.ts     # Generic base repository implementation
│   │   │   ├── userRepository.ts
│   │   │   └── articleRepository.ts
│   │   ├── routes/                   # Clean Express router definitions
│   │   │   ├── authRoutes.ts
│   │   │   ├── articleRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── services/                 # [Domain Logic] Business operations & policies
│   │   │   ├── authService.ts
│   │   │   ├── articleService.ts
│   │   │   ├── userService.ts
│   │   │   └── tokenService.ts       # Dedicated JWT handling (SRP)
│   │   ├── types/                    # Core TypeScript models, DTOs & interfaces
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── asyncHandler.ts       # Typed Express async error wrapper
│   │   ├── container.ts              # Composition Root / Dependency Injection
│   │   └── server.ts                 # ESM App entry point (:5000)
│   ├── tsconfig.json
│   ├── package.json                  # "type": "module" + tsx dev server
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── ArticleModal.jsx
│   │   │   ├── CategorySelector.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── constants/
│   │   │   └── categories.js     # Shared category list
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state
│   │   ├── pages/                # Clean page views
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── CreateArticlePage.jsx
│   │   │   ├── MyArticlesPage.jsx
│   │   │   └── EditArticlePage.jsx
│   │   ├── services/             # Frontend API service layer
│   │   │   ├── api.js            # Axios with credentials
│   │   │   ├── authService.js
│   │   │   ├── articleService.js
│   │   │   └── userService.js
│   │   ├── styles/
│   │   │   └── index.css         # Clean, simple design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                  # Root orchestration
└── README.md
```

---

## 💎 SOLID Principles Implementation

This codebase strictly implements all 5 **SOLID** principles of Object-Oriented Software Design:

### 1. Single Responsibility Principle (SRP)
* **Separation of Concerns:** Each class has a single, well-defined reason to change.
  * **Controllers** (`authController.ts`, `articleController.ts`, `userController.ts`): Exclusively handle HTTP status codes, request parsing, and response formatting.
  * **Services** (`authService.ts`, `articleService.ts`, `userService.ts`): Exclusively handle domain logic, permission checks, and business rules.
  * **Token Service** (`tokenService.ts`): Separated from authentication logic to isolate JWT generation, signature verification, and cookie options.
  * **Repositories** (`userRepository.ts`, `articleRepository.ts`): Exclusively manage database querying and schema persistence.

### 2. Open/Closed Principle (OCP)
* **Open for Extension, Closed for Modification:**
  * **Generic Base Repository** (`baseRepository.ts`): Implements `IBaseRepository<T>`. Any new entity repository (e.g. Comments, Categories) can extend `BaseRepository` without altering existing repository code.
  * **Feed Query Engine:** Supports dynamic filtering criteria (`FeedQueryOptions`) for category preferences, keyword searches, and author exclusions without mutating existing endpoints.

### 3. Liskov Substitution Principle (LSP)
* **Substitutability:**
  * Derived repositories (`UserRepository`, `ArticleRepository`) strictly honor the contract of `BaseRepository` and `IBaseRepository`.
  * High-level consumers depend only on `IUserRepository` or `IArticleRepository`. Any alternative implementation (e.g., `PostgresUserRepository` or `MockArticleRepository` for unit tests) can substitute for the MongoDB implementations without breaking services.

### 4. Interface Segregation Principle (ISP)
* **Fine-Grained Interfaces:** Clients are never forced to depend on methods they do not use.
  * User operations are segregated into `IUserReader` (queries) and `IUserWriter` (mutations) in `interfaces/IUserRepository.ts`.
  * Article operations are segregated into `IArticleReader` and `IArticleWriter` in `interfaces/IArticleRepository.ts`.
  * Infrastructure operations are segregated into `ITokenService` in `interfaces/ITokenService.ts`.

### 5. Dependency Inversion Principle (DIP)
* **Depend Upon Abstractions, Not Concretions:**
  * **Constructor Dependency Injection:**
    * `AuthService` depends on `IUserRepository` and `ITokenService` interfaces via constructor injection.
    * `ArticleService` depends on `IArticleRepository` and `IUserRepository` interfaces.
    * `UserService` depends on `IUserRepository` interface.
    * `Controllers` depend on their respective service interfaces (`IAuthService`, `IUserService`, `IArticleService`).
  * **Composition Root** (`container.ts`): Wires all concrete instances together at application bootstrap time, eliminating hardcoded imports of concrete implementations inside domain layers.

---

## 💻 Local Setup & Execution

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run MongoDB:**
   Ensure MongoDB is running locally at `mongodb://127.0.0.1:27017` or configure `MONGODB_URI` in `server/.env`.

3. **Start both Backend and Frontend:**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`
