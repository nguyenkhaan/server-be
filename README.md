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
```bash 
docker compose up -d 
```

### Install prisma 
```bash
bun prisma db push 
bun prisma generate 
``` 

## START THE APPLICATION 
- Dev Mode: 
```bash 
bun dev 
``` 
- Production Mode: 
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
        String name
        String email
        String password
        DateTime createdAt
        DateTime updatedAt
        Boolean active
    }
 
    UserRole {
        Int id PK
        Int userID FK
        Role role
    }
 
    User ||--o{ UserRole : "has"
```