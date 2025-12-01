# Patient Pathway Live

> A comprehensive healthcare assessment platform for ENT specialists to create, manage, and distribute medical quizzes to patients.

**Production URL**: https://patientpathway.ai/

---

## Table of Contents

- [Overview](#overview)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---
### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **bun**
- **Git**
- **Supabase account** (for backend)
- **Vercel account** (for deployment)

### Local Development Setup

```bash
git clone <YOUR_GIT_URL>
cd patientpathwaylive

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Configure your .env.local file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_RESEND_API_KEY=your-resend-key

# 5. Start development server
npm run dev

# 6. Open browser
# Navigate to http://localhost:8080
```


---

## Technology Stack

### Frontend
- **React** 18.3.1 - UI framework
- **TypeScript** 5.5.3 - Type safety
- **Vite** 5.4.1 - Build tool
- **Tailwind CSS** 3.4.11 - Styling
- **shadcn/ui** - Component library
- **React Query** 5.56.2 - Server state management
- **React Router** v6 - Client-side routing

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL 14+ database
  - Deno edge functions for backend
  - Authentication
- **Deno** - Edge function runtime

### Third-Party Services
- **Resend** - Email delivery (personal alias provided to accounts with domain)
- **Twilio** - SMS notifications
- **OpenRouter** - AI/LLM (Gemini 2.0)
- **OAuth** - Google

### Deployment
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend hosting

---

## Project Structure

```
patientpathwaylive/
├── src/ 
│   ├── components/  
│   │   ├── dashboard/ 
│   │   ├── quiz/          
│   │   ├── auth/        
│   │   ├── admin/    
│   │   └── ui/         
│   ├── pages/       
│   ├── hooks/              
│   ├── lib/                
│   ├── integrations/   
│   ├── types/          
│   └── data/        
│
├── supabase/          
│   ├── functions/      
│   └── migrations/   
│
├── public/    
│
└── Configuration Files
    ├── package.json    
    ├── vite.config.ts  
    ├── tailwind.config.ts
    ├── tsconfig.json     
    └── vercel.json   
```

---
### Common Commands

```bash
# Development
npm run dev        
npm run build      
npm run preview  
# Supabase
npx supabase start   
npx supabase functions deploy 
```

## Deployment

### Frontend (Vercel)

**Automatic Deployment:**
- Push to `main` branch → Production

### Backend (Supabase)

**Database Migrations:**
```bash
npx supabase db push
```

**Edge Functions:**
```bash
npx supabase functions deploy
```

### Environment Variables

Required variables for deployment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENROUTER_API_KEY`
- `VITE_RESEND_API_KEY`
---

## Support & Resources

### External Resources
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://typescriptlang.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Project Links
- **Production URL**: https://patientpathway.ai/

---
