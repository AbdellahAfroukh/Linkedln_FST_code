# Quick Start Guide

## Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **PostgreSQL** database running
- **Git** installed

## 1) Clone & Setup Environment Variables

```bash
git clone <repository-url>
cd Linkedln_FST_code
```

### Configure Backend Environment

1. Navigate to backend folder:

   ```bash
   cd backend
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your actual credentials:

   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name

   # JWT Security
   SECRET_KEY=your-secret-key-here

   # Email Configuration (Gmail SMTP)
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-specific-password

   # CORS Origins (comma-separated)
   CORS_ORIGINS=http://localhost:5173,http://localhost:8000

   # Scopus API (optional)
   SCOPUS_API_KEY=your-scopus-api-key
   ```

   **Important Notes:**
   - For Gmail SMTP, use an [App-Specific Password](https://support.google.com/accounts/answer/185833)
   - Generate a secure SECRET_KEY: `openssl rand -hex 32`
   - Ensure PostgreSQL is running and create the database before starting

## 2) Start Backend

Create and activate virtual environment:

```bash
python -m venv .venv
```

Activate:

- **Windows (PowerShell):**
  ```bash
  .\.venv\Scripts\Activate.ps1
  ```
- **Windows (cmd):**
  ```bash
  .\.venv\Scripts\activate.bat
  ```
- **macOS/Linux:**
  ```bash
  source .venv/bin/activate
  ```

Install dependencies and run:

```bash
pip install -r requirements.txt
python main.py
```

API will be available at: **http://localhost:8000**

## 3) Create the First Admin (One-time)

After the backend is running, create an admin user:

```bash
python scripts/create_admin.py --email admin@example.com --full-name "Admin User" --password "StrongPassword123"
```

## 4) Start Frontend

Open a new terminal, navigate to frontend folder:

```bash
cd frontend
npm install
npm run dev
```

App will be available at: **http://localhost:5173**

---

## 🎉 You're Ready!

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

Login with your admin credentials to start using the platform!

---

## Troubleshooting

### Backend won't start

**Error: "ValidationError: Field required"**

- Make sure you created and filled the `.env` file in the `backend` folder
- Verify all required fields are present (DATABASE_URL, SECRET_KEY, SMTP_USER, SMTP_PASSWORD, CORS_ORIGINS, SCOPUS_API_KEY)

**Error: "Could not connect to database"**

- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` has correct credentials
- Create the database if it doesn't exist: `createdb your_database_name`

**Error: "SMTP Authentication failed"**

- For Gmail, use an App-Specific Password, not your regular password
- Enable 2-Step Verification in your Google Account first

### Frontend won't start

**Error: "npm: command not found"**

- Install Node.js from https://nodejs.org/

**Error: "Failed to fetch from API"**

- Make sure backend is running on http://localhost:8000
- Check CORS_ORIGINS in backend `.env` includes http://localhost:5173

---

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
