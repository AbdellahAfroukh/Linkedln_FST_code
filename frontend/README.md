# Academic Platform Frontend

A modern, production-ready React frontend for the Academic Platform API built with TypeScript, Vite, TailwindCSS, and TanStack Query.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with automatic token refresh
  - 2FA (TOTP) support
  - Role-based access control (Admin, Enseignant, Doctorant)
  - Profile completion flow
  - Protected routes

- **Core Features**
  - Posts feed with comments and reactions (6 types)
  - Connections management (send/accept/reject requests)
  - Real-time messaging (chat system)
  - CV builder (contacts, formations, competences, langues, experiences)
  - Research projects (Projets) management
  - Google Scholar integration & publication sync
- **Admin Panel**
  - Organization management (Universities, Etablissements, Departements, etc.)
  - User management (CRUD, search, activation toggle)
  - Content moderation (posts, comments, projets)
  - Platform statistics dashboard

## 📋 Prerequisites

- Node.js 18+ and npm
- Running FastAPI backend on `http://localhost:8000`

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**

   ```bash
   # .env file is already created
   # Update VITE_API_BASE_URL if backend is on different URL
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                    # API client and endpoint functions
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── admin.ts           # Admin & organization endpoints
│   │   ├── posts.ts           # Posts, comments, reactions
│   │   ├── connections.ts     # Connection management
│   │   ├── chats.ts           # Messaging endpoints
│   │   ├── cv.ts              # CV management
│   │   ├── google-scholar.ts  # Google Scholar integration
│   │   ├── projets.ts         # Projects endpoints
│   │   └── index.ts           # Re-exports
│   │
│   ├── components/
│   │   ├── ui/                # Reusable UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── label.tsx
│   │   │   └── ... (more components)
│   │   ├── auth/              # Auth-specific components
│   │   │   └── protected-route.tsx
│   │   └── providers/         # Context providers
│   │       ├── query-provider.tsx
│   │       └── toast-provider.tsx
│   │
│   ├── features/              # Feature modules (pages & components)
│   │   ├── auth/
│   │   │   └── pages/
│   │   │       ├── login-page.tsx
│   │   │       ├── register-page.tsx
│   │   │       └── complete-profile-page.tsx
│   │   ├── dashboard/
│   │   ├── posts/
│   │   ├── connections/
│   │   ├── chats/
│   │   ├── cv/
│   │   ├── projets/
│   │   ├── google-scholar/
│   │   └── admin/
│   │
│   ├── layouts/               # Layout components
│   │   ├── app-layout.tsx    # Main app layout with sidebar
│   │   └── auth-layout.tsx   # Authentication pages layout
│   │
│   ├── lib/                   # Utilities
│   │   ├── api-client.ts     # Axios instance with interceptors
│   │   └── utils.ts          # Helper functions
│   │
│   ├── store/                 # State management (Zustand)
│   │   └── auth.ts           # Authentication state
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts          # All API types
│   │
│   ├── App.tsx               # Main app component with routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles (Tailwind)
│
├── API_INVENTORY.md          # Complete API documentation
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md (this file)
```

## 🎯 Architecture Overview

### API Layer (`src/api/`)

- Modular API functions grouped by feature
- Type-safe request/response handling
- Centralized error handling
- Automatic token attachment via interceptors

### State Management

- **TanStack Query** for server state (caching, refetching, mutations)
- **Zustand** for client state (auth, UI preferences)
- Persistent auth state in localStorage

### Authentication Flow

1. User logs in → receives JWT tokens
2. Tokens stored in memory + localStorage
3. Access token attached to all requests via interceptor
4. Automatic token refresh on 401 errors
5. 2FA verification if enabled
6. Profile completion check for new users

### Type Safety

- All API types mirrored from backend Pydantic schemas
- Strict TypeScript configuration
- Zod schemas for form validation matching backend constraints

## 🔑 Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000  # Backend API URL
```

## 📖 API Integration Reference

See [API_INVENTORY.md](./API_INVENTORY.md) for complete API documentation including:

- All endpoints grouped by feature
- Request/response schemas
- Authentication requirements
- Error response formats
- Role-based access control details

## 🎨 UI Components

Built with **shadcn/ui** components based on Radix UI:

- Fully accessible
- Customizable with Tailwind
- Consistent design system
- Dark mode support (theme configured)

## 🔐 Authentication & Authorization

### Protected Routes

```tsx
// Requires authentication
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

// Requires specific role
<Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
```

### Using Auth in Components

```tsx
import { useAuthStore } from "@/store/auth";

function MyComponent() {
  const { user, logout } = useAuthStore();

  if (user?.user_type === "admin") {
    // Show admin features
  }
}
```

## 📡 Making API Calls

### Using TanStack Query Hooks

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api";
import { toast } from "sonner";

// Fetch data
function PostsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", "feed"],
    queryFn: () => postsApi.getFeed({ skip: 0, limit: 50 }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div>
      {data?.posts.map((post) => (
        <div key={post.id}>{post.content}</div>
      ))}
    </div>
  );
}

// Mutate data
function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create post");
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

## 🎯 Implementation Checklist

### ✅ Completed

- [x] Project setup (Vite + React + TypeScript)
- [x] TailwindCSS configuration
- [x] API client with JWT interceptors
- [x] TypeScript types from backend schemas
- [x] All API endpoint functions
- [x] Authentication store (Zustand)
- [x] Protected routes
- [x] App layout with responsive sidebar
- [x] Login/Register pages with 2FA
- [x] Dashboard page

### 🚧 To Be Implemented (Follow the Pattern Below)

Each feature needs:

1. **API hooks** (in feature folder or use direct API calls)
2. **Forms** with react-hook-form + zod validation
3. **List pages** with pagination/infinite scroll
4. **Detail pages**
5. **Create/Edit modals or pages**
6. **Delete confirmations**

#### Admin Features

- [ ] Universities CRUD with form validation
- [ ] Etablissements CRUD with parent university selection
- [ ] Departements CRUD
- [ ] Laboratoires CRUD
- [ ] Equipes CRUD
- [ ] Specialites CRUD
- [ ] Thematiques CRUD
- [ ] User management table with search & filters
- [ ] User detail page with edit capability
- [ ] Content moderation dashboard
- [ ] Platform statistics cards

#### Posts Feature

- [ ] Create post form with file upload
- [ ] Posts feed with infinite scroll
- [ ] Post card with reactions (6 types with icons)
- [ ] Comment section
- [ ] Edit/delete post modals
- [ ] Filter by public/connections

#### Connections Feature

- [ ] Send connection request modal
- [ ] Pending requests tabs (incoming/outgoing)
- [ ] Accept/reject buttons
- [ ] Connections list
- [ ] Mutual connections view

#### Chat Feature

- [ ] Chat list sidebar
- [ ] Message thread view
- [ ] Send message form
- [ ] Real-time updates (polling or WebSocket)
- [ ] New chat modal (select user)

#### CV Feature

- [ ] CV overview page
- [ ] Contact section with edit
- [ ] Formations list with add/edit/delete
- [ ] Competences tags with management
- [ ] Langues list
- [ ] Experiences timeline
- [ ] Public/private toggle
- [ ] Enable/disable CV

#### Projets Feature

- [ ] Projects list with search & filters
- [ ] Create project form (enseignant only)
- [ ] Project detail page
- [ ] Edit/delete project (owner only)
- [ ] Filter by status
- [ ] User's projects view

#### Google Scholar Feature

- [ ] Link account form with QR code display
- [ ] Sync publications button
- [ ] Publications list
- [ ] Toggle posted status
- [ ] Unlink confirmation

#### Profile Completion

- [ ] Multi-step form
- [ ] Organization dropdowns (cascading)
- [ ] Numero de somme field (enseignant only)
- [ ] Form validation

## 🎨 Styling Guidelines

- Use Tailwind utility classes
- Follow shadcn/ui component patterns
- Responsive design (mobile-first)
- Consistent spacing (4, 6, 8 scale)
- Use theme colors from CSS variables

## 🐛 Error Handling

### API Errors

```tsx
// Handled automatically by react-query
// Display with toast notifications
import { toast } from "sonner";

toast.error("Something went wrong");
toast.success("Action completed");
toast.info("Information message");
```

### Form Validation

```tsx
// Using react-hook-form + zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Output will be in dist/
# Deploy dist/ folder to your hosting service (Vercel, Netlify, etc.)
```

### Environment Variables for Production

Set `VITE_API_BASE_URL` to your production API URL.

## 📚 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router 6** - Routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Radix UI** - Headless components
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

## 🤝 Contributing

When implementing a new feature:

1. Create types in `src/types/index.ts`
2. Add API functions in `src/api/[feature].ts`
3. Create feature folder in `src/features/[feature]/`
4. Add pages in `pages/` subfolder
5. Create reusable components in `components/` subfolder
6. Add route in `App.tsx`
7. Test authentication & authorization
8. Handle loading states & errors
9. Add form validation with Zod
10. Implement pagination if needed

## 📝 Notes

- All forms must validate against backend Pydantic constraints
- Use skeleton loaders for loading states
- Implement optimistic updates where appropriate
- Keep components small and focused
- Extract reusable logic into custom hooks
- Follow the established folder structure

## 🔗 Related Documentation

- [API Inventory](./API_INVENTORY.md) - Complete backend API reference
- [Backend Repository](../backend/) - FastAPI backend code

## 📞 Support

For issues or questions:

1. Check API_INVENTORY.md for endpoint details
2. Review the implemented auth/dashboard patterns
3. Check backend FastAPI docs at `http://localhost:8000/docs`

---

**Built with ❤️ for the FST Academic Community**
