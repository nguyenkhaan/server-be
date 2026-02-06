# BE-SERVER 

A modern backend service built with a scalable architecture and industry-standard tooling.  
Designed for maintainability, performance, and long-term growth.

---

## 🛠 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-ESNext-339933?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-Runtime-000000?logo=bun&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-Framework-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)

---

## 🚀 Getting Started

### Prerequisites
Ensure the following tools are installed on your system:

- **Bun** (recommended runtime)
- **Node.js** (LTS or newer)
- **Docker** & **Docker Compose**
- **PostgreSQL** (if running without Docker)

---

### Installation

```bash
bun install
```

### Environment Setup
- Copy the .env file (see the template in .env.example) 

### Run Docker 

- Install the docker extension in VSCODE. 
- After it, right-mouse button click to the docker-compose.yml file in the project. 
- You will see Compose up - Select Devices. Click to it and chooose postgres sql and minio-app. Turn off the api services. Click **Go** to build these containers. 

### Install prisma 
- **Cautions**: Please confirm that you already have **.env** files in the root of your project. 
- Run these commands step by step: 
```bash
bun prisma db push 
bun prisma generate 
``` 

## START THE APPLICATION 
- Dev Mode: 
```bash 
bun dev 
``` 
- Production Mode: (Do not touched)
```bash
bun build 
bun start  
```

## Folder Structure 
```
/
├── .husky/              # Git hooks for pre-commit checks
├── dist/                # Compiled TypeScript output
├── prisma/              # Prisma schema, migrations, and seeds
│   ├── migrations/      # Database migration files
│   └── schema.prisma    # Main Prisma schema file
├── src/                 # Main application source code
│   ├── app/             # Core application modules
│   │   ├── auth/        # Authentication-related logic
│   │   ├── user/        # User management logic
│   │   └── ...          # Other business domain modules
│   ├── common/          # Shared utilities, constants, and decorators
│   │   ├── constants/   # Application-wide constants
│   │   ├── decorators/  # Custom decorators
│   │   └── utils/       # Utility functions
│   ├── configs/         # Configuration files (e.g., database, auth)
│   ├── database/        # Database connection and seeding logic
│   ├── generated/       # Auto-generated code (e.g., Prisma Client)
│   ├── shared/          # Shared modules and services
│   └── main.ts          # Application entry point
├── .env                 # Environment variables (local)
├── .env.example         # Example environment variables
├── .gitignore           # Files and folders to ignore in Git
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Dockerfile for building the application image
├── nest-cli.json        # NestJS CLI configuration
└── package.json         # Project dependencies and scripts
```

## Database Diagram
```mermaid
erDiagram
    User {
        Int id PK
        Boolean active
        String name
        String email
        String password
        String profile_avatr
        DateTime date_of_birth
        DateTime updatedAt
        DateTime createdAt
    }

    UserRole {
        Int id PK
        Int userID FK
        Role role
    }

    Artist {
        Int id PK
        Int user_id "nullable"
        Boolean active
        String name
        String profile_avatar "nullable"
    }

    Album {
        Int id PK
        Int artistID FK
        String name
        DateTime release_date
        String thumbnail
    }

    Track {
        Int id PK
        Int albumID FK
        String title
        Int duration
        String file_path
        Int track_number "nullable"
    }

    Genre {
        Int id PK
        String name
    }

    Playlist {
        Int id PK
        String name
        String img "nullable"
        Int userID FK
    }

    EmailVerificationToken {
        Int id PK
        String token
        DateTime createdAt
        DateTime usedAt "nullable"
        DateTime expiresAt
        String email
    }

    PasswordVerificationToken {
        Int id PK
        String token
        DateTime createdAt
        DateTime usedAt "nullable"
        DateTime expiresAt
        String email
    }

    AuthToken {
        Int id PK
        String token
        Int user_id FK
        Boolean isActive
        DateTime createdAt
        DateTime expiresAt
        AUTHTOKENTYPE type
    }

    Followers {
        Int userID PK, FK
        Int artistID PK, FK
    }

    Likes {
        Int userID PK, FK
        Int trackID PK, FK
    }

    listeningHistory {
        Int userID PK, FK
        Int trackID PK, FK
        DateTime played_at
    }

    ArtistGenre {
        Int artistID PK, FK
        Int genreID PK, FK
    }

    AlbumGenre {
        Int genreID PK, FK
        Int albumID PK, FK
    }

    TrackArtist {
        Int trackID PK, FK
        Int artistID PK, FK
    }

    PlaylistTrack {
        Int playlistID PK, FK
        Int trackID PK, FK
    }

    User ||--o{ UserRole : "has"
    User ||--o{ Playlist : "creates"
    User ||--o{ AuthToken : "has"
    User }o--o{ Followers : "follows"
    User }o--o{ Likes : "likes"
    User }o--o{ listeningHistory : "listens to"

    Artist ||--o{ Album : "produces"
    Artist }o--o{ Followers : "is followed by"
    Artist }o--o{ ArtistGenre : "has genre"
    Artist }o--o{ TrackArtist : "performs on"

    Album ||--o{ Track : "contains"
    Album }o--o{ AlbumGenre : "has genre"

    Track }o--o{ Likes : "is liked by"
    Track }o--o{ listeningHistory : "is listened to by"
    Track }o--o{ TrackArtist : "features"
    Track }o--o{ PlaylistTrack : "is in"

    Genre }o--o{ ArtistGenre : "categorizes"
    Genre }o--o{ AlbumGenre : "categorizes"

    Playlist }o--o{ PlaylistTrack : "contains"
```