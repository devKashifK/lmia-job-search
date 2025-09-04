# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is **Job Maze**, a Next.js application for searching LMIA (Labour Market Impact Assessment) jobs in Canada. The application provides two main search types: "Hot Leads" for trending job opportunities and "LMIA" for official LMIA job listings.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL with custom RPC functions)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand + React Query (@tanstack/react-query)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini API
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Charts**: ECharts and Recharts

## Architecture

### Route Structure
The application uses Next.js App Router with grouped routes:

- `(unauthenticated)/` - Public pages (landing, sign-in, sign-up, pricing, contact)
- `(authenticated)/` - Protected pages (dashboard, search, analysis, roles, company)
- `api/` - API routes (summary endpoint using Gemini AI)

### Key Components Architecture

**State Management**: 
- Global state via Zustand store (`src/context/store.ts`)
- Server state via React Query
- Session management via custom SessionProvider

**Database Integration**:
- Supabase client configured in `src/db.ts`
- Custom RPC functions for search (`rpc_search_hot_leads_new`, `rpc_search_lmia`, `suggest_trending_job`)
- Credits system for search tracking

**Component Structure**:
- `components/ui/` - Reusable UI components (shadcn/ui based)
- `components/search-components/` - Search-specific components
- `components/filters/` - Data filtering components
- `components/job-description/` - Job detail display components

### Key Features
- **Fuzzy Search**: PostgreSQL pg_trgm for type-ahead suggestions
- **Credit System**: Users consume credits for searches
- **Dual Search Types**: Hot Leads vs LMIA official postings
- **Advanced Filtering**: Dynamic filter panels with multi-select
- **Job Analysis**: AI-powered job market insights
- **Responsive Design**: Mobile-first approach

## Common Development Commands

```bash
# Development
npm run dev              # Start development server on port 3000
npm run build           # Create production build
npm run start           # Start production server
npm run lint            # Run ESLint

# Docker
docker-compose up       # Run containerized app on port 5300
```

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=     # Supabase project URL
NEXT_PUBLIC_SUPABASE_KEY=     # Supabase anon key
GEMINI_API_KEY=               # Google Gemini API key
```

## Development Patterns

### Database Operations
- All database calls use the Supabase client from `src/db.ts`
- Search operations primarily use custom RPC functions
- Authentication state managed through SessionProvider

### Search Implementation
The application implements two search types with different data sources:
- **Hot Leads**: Real-time job postings from `hot_leads_new` table
- **LMIA**: Official LMIA data from `lmia` table

Search flow: User input → Suggestions API → Credit check → RPC call → Results display

### Component Patterns
- Heavy use of shadcn/ui components with custom styling
- Framer Motion for animations and transitions
- Custom hooks for session, credits, and data fetching
- TypeScript interfaces for type safety

### State Management
```typescript
// Global state example
const { data, setDataConfig, setFilterPanelConfig } = useTableStore()

// Server state example  
const { creditData, creditError, creditRemaining } = useCreditData()
```

## Key Files to Understand

- `src/app/(authenticated)/search/page.tsx` - Main search interface
- `src/context/store.ts` - Global state management
- `src/hooks/use-session.tsx` - Authentication state
- `src/hooks/use-credits.tsx` - Credit system management
- `src/components/ui/dynamic-data-view.tsx` - Data display configurations

## Database Schema Context

The application works with several key tables:
- `hot_leads_new` - Job postings data
- `lmia` - Official LMIA records  
- `credits` - User credit tracking
- `searches` - Search history and saved searches

Custom RPC functions handle complex search operations with fuzzy matching and filtering.

## Development Notes

- TypeScript errors and ESLint warnings are ignored in build (see next.config.ts)
- Custom brand colors defined in Tailwind config
- Heavy reliance on server-side RPC functions for data operations
- Credit-based system controls user search access
- Components use "use client" directive where interactivity is needed
