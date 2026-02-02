# Quick Start Guide

## 🚀 Getting Started (First Time Setup)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Verify Backend is Running

```bash
# In backend terminal
cd backend
uvicorn main:app --reload
# Should be running on http://localhost:8000
```

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
# Opens on http://localhost:3000
```

### 4. Test the Application

1. Go to http://localhost:3000
2. Click "Sign up" to create an account
3. Login with your credentials
4. You'll see the dashboard

---

## 📝 Development Workflow

### Adding a New Feature

**Example: Implementing the Posts Feed**

#### Step 1: Create the Component Structure

```bash
frontend/src/features/posts/
├── components/
│   ├── post-card.tsx          # Individual post display
│   ├── create-post-form.tsx   # Form to create posts
│   ├── comment-section.tsx    # Comments list + form
│   └── reaction-buttons.tsx   # Like, love, etc.
├── hooks/
│   └── use-posts.ts           # Custom hooks for posts
└── pages/
    └── posts-feed-page.tsx    # Main feed page
```

#### Step 2: Implement Data Fetching

```tsx
// features/posts/hooks/use-posts.ts
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api";

export function usePosts() {
  return useQuery({
    queryKey: ["posts", "feed"],
    queryFn: () => postsApi.getFeed({ skip: 0, limit: 50 }),
  });
}
```

#### Step 3: Build the UI Component

```tsx
// features/posts/pages/posts-feed-page.tsx
import { usePosts } from "../hooks/use-posts";
import { PostCard } from "../components/post-card";

export function PostsFeedPage() {
  const { data, isLoading } = usePosts();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {data?.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### Step 4: Test with Backend

- Create a post via API docs (http://localhost:8000/docs)
- Refresh your frontend
- Post should appear

---

## 🎨 UI Components Guide

### Using shadcn/ui Components

All UI components are in `src/components/ui/`. Here's how to use them:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Adding More Components

Need a component not yet added? Install from shadcn/ui:

```bash
# For dialogs
npx shadcn-ui@latest add dialog

# For data tables
npx shadcn-ui@latest add table

# For dropdowns
npx shadcn-ui@latest add dropdown-menu
```

---

## 🔧 Common Tasks

### 1. Add a New API Endpoint

**Example: Adding a "like post" endpoint**

```tsx
// src/api/posts.ts
export const postsApi = {
  // ... existing methods ...

  likePost: async (postId: number): Promise<void> => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  },
};
```

### 2. Create a Form with Validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define schema matching backend validation
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("title")} />
      {form.formState.errors.title && (
        <span className="text-red-600">
          {form.formState.errors.title.message}
        </span>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 3. Show Loading & Error States

```tsx
import { useQuery } from "@tanstack/react-query";

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["myData"],
    queryFn: fetchMyData,
  });

  if (isLoading) {
    return <div>Loading...</div>; // Or use skeleton loader
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>{/* Render data */}</div>;
}
```

### 4. Display Toast Notifications

```tsx
import { toast } from "sonner";

function MyComponent() {
  const handleSuccess = () => {
    toast.success("Action completed successfully!");
  };

  const handleError = () => {
    toast.error("Something went wrong");
  };

  const handleInfo = () => {
    toast.info("This is an informational message");
  };

  return <button onClick={handleSuccess}>Click me</button>;
}
```

### 5. Protect Routes by Role

```tsx
// In App.tsx
import { RoleProtectedRoute } from "./components/auth/protected-route";

<Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>;
```

### 6. Access Current User

```tsx
import { useAuthStore } from "@/store/auth";

function MyComponent() {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <p>Welcome, {user?.fullName}</p>
      <p>Role: {user?.user_type}</p>
      {user?.user_type === "admin" && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🐛 Debugging Tips

### Check API Calls

Open browser DevTools → Network tab → Filter by "Fetch/XHR" to see all API requests.

### Check React Query State

The React Query DevTools are enabled at the bottom of the page (red icon).

### Common Issues

**Issue: "Token expired" error**

- Solution: Refresh token flow should handle this automatically. Check console for errors.

**Issue: CORS errors**

- Solution: Backend must be running with CORS enabled. Check backend/main.py

**Issue: TypeScript errors**

- Solution: Run `npm run build` to see all type errors

**Issue: Styles not applying**

- Solution: Ensure Tailwind is configured correctly. Check `tailwind.config.js` and `postcss.config.js`

---

## 📚 Reference

### Key Files to Know

- `src/App.tsx` - Main app component with all routes
- `src/api/` - All API endpoint functions
- `src/types/index.ts` - All TypeScript types
- `src/lib/api-client.ts` - Axios instance with JWT interceptors
- `src/store/auth.ts` - Authentication state management
- `src/layouts/app-layout.tsx` - Main app layout with sidebar

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000  # Backend API URL
```

### NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### API Documentation

- FastAPI Swagger UI: http://localhost:8000/docs
- API Inventory: `frontend/API_INVENTORY.md`
- Implementation Guide: `frontend/IMPLEMENTATION_GUIDE.md`

---

## ✅ Testing Checklist Before Committing

- [ ] No TypeScript errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Tested on mobile view (responsive)
- [ ] Loading states work
- [ ] Error handling works
- [ ] Forms validate correctly
- [ ] Toast notifications appear
- [ ] Backend integration successful

---

## 🎯 Next Feature to Implement

Pick one from the priority list:

1. **Posts Feed** (High Priority)
   - Create post form
   - Display posts with user info
   - Add comments
   - Implement reactions

2. **CV Builder** (High Priority)
   - CV sections display
   - Add/edit/delete for each section
   - Public/private toggle

3. **Connections** (Medium Priority)
   - Send connection requests
   - Accept/reject UI
   - Connections list

See `IMPLEMENTATION_GUIDE.md` for detailed instructions on each feature.

---

**Happy coding! 🚀**
