# Quick Start (Run the App)

## 1) Start Backend

```bash
cd backend
python -m venv .venv
```

Activate:

- Windows (PowerShell):
  ```bash
  .\.venv\Scripts\Activate.ps1
  ```
- Windows (cmd):
  ```bash
  .\.venv\Scripts\activate.bat
  ```
- macOS/Linux:
  ```bash
  source .venv/bin/activate
  ```

```bash
pip install -r requirements.txt
python main.py
```

API: http://localhost:8000

## 2) Create the First Admin (One-time)

```bash
python scripts/create_admin.py --email admin@example.com --full-name "Admin User" --password "StrongPassword123"
```

## 3) Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

App: http://localhost:5173

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

---

**Happy coding! 🚀**
