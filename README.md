# Walleto Frontend

Walleto is a full-stack digital wallet application designed to provide a secure interface for managing wallet balances, funding sources, beneficiaries, transfers, deposits, withdrawals, transactions, and account settings.

This repository contains the **Next.js frontend** for Walleto. It communicates with the Walleto NestJS backend through a REST API.

## Tech Stack

- **Next.js** 16.3.1
- **React** 19.2.8
- **TypeScript**
- **Tailwind CSS** 4
- **Recharts** 3
- **ESLint** 9

## Features

The frontend currently includes interfaces for:

- User authentication
- Dashboard and wallet overview
- Wallet balance management
- Deposits
- Withdrawals
- Money transfers
- Saved beneficiaries
- Funding sources
- Transaction history
- Profile and account settings
- OTP-based transaction flows
- Administrative dashboard
- User/account administration
- Transaction administration
- Responsive navigation for mobile and desktop

## Application Structure

```text
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── Admin.tsx
│   ├── AdminSidebar.tsx
│   ├── Auth.tsx
│   ├── Cards.tsx
│   ├── Dashboard.tsx
│   ├── DepositWithdraw.tsx
│   ├── MobileNav.tsx
│   ├── ProfileSettings.tsx
│   ├── SendMoney.tsx
│   ├── Sidebar.tsx
│   ├── Transactions.tsx
│   └── ui.tsx
│
├── config/
│   └── currency.ts
│
└── lib/
    ├── admin.ts
    ├── api.ts
    ├── beneficiaries.ts
    ├── formatMoney.ts
    ├── fundingSources.ts
    ├── otp.ts
    ├── transactions.ts
    ├── users.ts
    └── wallet.ts
```

The `lib` directory contains the frontend API/data-access functions, while the `components` directory contains the primary application interfaces.

## Getting Started

### Prerequisites

Make sure you have:

- Node.js 20+
- npm
- The Walleto backend running locally or an accessible deployed backend

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/eclemz/walleto-frontend.git
cd walleto-frontend
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` specifies the base URL of the Walleto backend API.

For the Docker Compose setup used by the full Walleto application, the frontend is built with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Development

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

If the backend is using the local Docker Compose configuration, the backend is exposed at:

```text
http://localhost:3002
```

## Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Docker

The frontend includes a multi-stage Dockerfile.

The image:

- Uses Node.js 22 Alpine
- Installs dependencies in a dedicated build stage
- Builds the Next.js application
- Installs production dependencies in the runtime stage
- Removes npm and npx from the runtime image
- Runs the application as the non-root `node` user

Build the image manually:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3002 \
  -t walleto-frontend .
```

Run the container:

```bash
docker run --rm \
  -p 3001:3000 \
  walleto-frontend
```

The application will then be available at:

```text
http://localhost:3001
```

## Docker Compose

The complete Walleto application can be run using Docker Compose from the project root.

The Compose stack contains:

```text
Next.js Frontend
      │
      ▼
NestJS Backend
      │
      ▼
PostgreSQL
```

Start the complete stack:

```bash
docker compose up -d --build
```

Check the running services:

```bash
docker compose ps
```

The local Docker Compose services are exposed as:

| Service     | URL/Port              |
| ----------- | --------------------- |
| Frontend    | http://localhost:3001 |
| Backend API | http://localhost:3002 |
| PostgreSQL  | localhost:5433        |

Stop the stack:

```bash
docker compose down
```

## API Communication

The frontend communicates with the NestJS backend through the API helper in:

```text
src/lib/api.ts
```

Authenticated requests use the user's JWT access token.

The frontend API modules are separated according to application functionality:

```text
src/lib/
├── admin.ts
├── beneficiaries.ts
├── fundingSources.ts
├── otp.ts
├── transactions.ts
├── users.ts
└── wallet.ts
```

## Backend

The corresponding Walleto backend is built with NestJS, Prisma, and PostgreSQL.

Backend repository:

https://github.com/eclemz/walleto-backend

The backend provides authentication, wallet operations, transaction processing, OTP verification, beneficiary management, funding sources, and administrative functionality.

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production Next.js server.

```bash
npm run lint
```

Runs ESLint.

## Development Notes

The `NEXT_PUBLIC_API_URL` variable is embedded into the Next.js client bundle during the build process.

When using Docker, pass it as a build argument:

```bash
--build-arg NEXT_PUBLIC_API_URL=http://localhost:3002
```

For Docker Compose, this is configured in the root `docker-compose.yml`.

Do not commit `.env.local` or other environment files containing secrets or environment-specific configuration.

## Project Status

Walleto is a portfolio full-stack application demonstrating:

- Modern React/Next.js development
- REST API integration
- Authentication and authorisation
- Financial transaction workflows
- Role-based administrative functionality
- Responsive application design
- Docker containerisation
- PostgreSQL database integration
- Full-stack application architecture
