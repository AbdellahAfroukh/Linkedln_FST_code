# Frontend Implementation Guide

## Overview

This document provides detailed implementation guidance for completing the Academic Platform frontend. The foundation has been laid with:

- Complete project structure
- All API endpoints typed and ready to use
- Authentication system fully implemented
- Basic pages and routing configured
- Component library (shadcn/ui) set up

## Endpoint → UI Mapping

### Authentication (/auth)

| Endpoint                    | UI Location                                     | Status      | Notes                               |
| --------------------------- | ----------------------------------------------- | ----------- | ----------------------------------- |
| POST /auth/register         | `features/auth/pages/register-page.tsx`         | ✅ Done     | Includes validation                 |
| POST /auth/login            | `features/auth/pages/login-page.tsx`            | ✅ Done     | With 2FA support                    |
| POST /auth/verify-2fa       | `features/auth/pages/login-page.tsx`            | ✅ Done     | Part of login flow                  |
| POST /auth/complete-profile | `features/auth/pages/complete-profile-page.tsx` | ⚠️ Scaffold | Needs full form implementation      |
| POST /auth/setup-2fa        | Settings page (to create)                       | ❌ Todo     | QR code display with qrcode library |
| POST /auth/enable-2fa       | Settings page (to create)                       | ❌ Todo     | Verify OTP to enable                |
| POST /auth/disable-2fa      | Settings page (to create)                       | ❌ Todo     | Password confirmation               |
| GET /auth/me                | `store/auth.ts`                                 | ✅ Done     | Auto-fetched on app load            |
| POST /auth/logout           | `layouts/app-layout.tsx`                        | ✅ Done     | Logout button                       |

### Posts (/posts)

| Endpoint                              | UI Location                                | Status      | Implementation Notes                      |
| ------------------------------------- | ------------------------------------------ | ----------- | ----------------------------------------- |
| POST /posts/                          | Create post form                           | ❌ Todo     | Modal or inline form with react-hook-form |
| GET /posts/feed                       | `features/posts/pages/posts-feed-page.tsx` | ⚠️ Scaffold | Infinite scroll with useInfiniteQuery     |
| GET /posts/user/{id}                  | User profile page (to create)              | ❌ Todo     | Filtered by user                          |
| GET /posts/{id}                       | Post detail page (to create)               | ❌ Todo     | Full post with all comments               |
| PATCH /posts/{id}                     | Edit post modal                            | ❌ Todo     | Owner only                                |
| DELETE /posts/{id}                    | Delete confirmation dialog                 | ❌ Todo     | Owner only                                |
| POST /posts/{id}/comments             | Comment form under post                    | ❌ Todo     | Inline form                               |
| PATCH /posts/comments/{id}            | Edit comment inline                        | ❌ Todo     | Small edit form                           |
| DELETE /posts/comments/{id}           | Delete icon on comment                     | ❌ Todo     | Comment owner or post owner               |
| POST /posts/{id}/reactions            | Reaction buttons on post                   | ❌ Todo     | 6 reaction types with icons               |
| DELETE /posts/{id}/reactions          | Remove reaction                            | ❌ Todo     | Click same reaction to remove             |
| POST /posts/comments/{id}/reactions   | Reaction on comment                        | ❌ Todo     | Same as post reactions                    |
| DELETE /posts/comments/{id}/reactions | Remove comment reaction                    | ❌ Todo     | Click to remove                           |

**Reaction Types:** like, love, funny, angry, sad, dislike
Use lucide-react icons: ThumbsUp, Heart, Laugh, Angry, Frown, ThumbsDown

### Admin - Organizations (/admin)

All admin endpoints are admin-only. Create a tabbed interface for each entity type.

| Entity         | CRUD Operations                   | UI Location                                    | Status  |
| -------------- | --------------------------------- | ---------------------------------------------- | ------- |
| Universities   | Create, List, Get, Update, Delete | `features/admin/pages/universities-page.tsx`   | ❌ Todo |
| Etablissements | Create, List, Get, Update, Delete | `features/admin/pages/etablissements-page.tsx` | ❌ Todo |
| Departements   | Create, List, Get, Update, Delete | `features/admin/pages/departements-page.tsx`   | ❌ Todo |
| Laboratoires   | Create, List, Get, Update, Delete | `features/admin/pages/laboratoires-page.tsx`   | ❌ Todo |
| Equipes        | Create, List, Get, Update, Delete | `features/admin/pages/equipes-page.tsx`        | ❌ Todo |
| Specialites    | Create, List, Get, Update, Delete | `features/admin/pages/specialites-page.tsx`    | ❌ Todo |
| Thematiques    | Create, List, Get, Update, Delete | `features/admin/pages/thematiques-page.tsx`    | ❌ Todo |

**Pattern for each:**

```tsx
// 1. Data table with columns
// 2. "Add New" button opens dialog
// 3. Edit icon on each row
// 4. Delete icon with confirmation
// 5. Search/filter if needed
```

### Admin - User Management (/admin/users)

| Endpoint                                  | UI Component             | Status  | Notes                       |
| ----------------------------------------- | ------------------------ | ------- | --------------------------- |
| GET /admin/users                          | Users list page          | ❌ Todo | Table with pagination       |
| GET /admin/users/search                   | Search bar on users page | ❌ Todo | Debounced search input      |
| GET /admin/users/{id}                     | User detail page         | ❌ Todo | Full user info              |
| PATCH /admin/users/{id}                   | Edit user form           | ❌ Todo | Admin can change role, etc. |
| DELETE /admin/users/{id}                  | Delete confirmation      | ❌ Todo | Dangerous action            |
| PATCH /admin/users/{id}/toggle-activation | Toggle switch            | ❌ Todo | Enable/disable user         |

### Admin - Content Moderation

| Endpoint                       | UI Component          | Status  | Notes                   |
| ------------------------------ | --------------------- | ------- | ----------------------- |
| GET /admin/posts               | All posts list        | ❌ Todo | With moderation actions |
| GET /admin/comments            | All comments list     | ❌ Todo | With delete action      |
| DELETE /admin/posts/{id}       | Delete button         | ❌ Todo | Moderation              |
| DELETE /admin/comments/{id}    | Delete button         | ❌ Todo | Moderation              |
| DELETE /admin/users/{id}/posts | Delete all user posts | ❌ Todo | Dangerous bulk action   |
| GET /admin/projets             | All projets list      | ❌ Todo | Moderation              |
| DELETE /admin/projets/{id}     | Delete button         | ❌ Todo | Moderation              |

### Admin - Statistics

| Endpoint              | UI Component    | Status      | Notes                  |
| --------------------- | --------------- | ----------- | ---------------------- |
| GET /admin/statistics | Admin dashboard | ⚠️ Scaffold | Stat cards with counts |

### CV Management (/cv)

| Endpoint                  | UI Component        | Status      | Notes                |
| ------------------------- | ------------------- | ----------- | -------------------- |
| POST /cv/create           | CV creation button  | ❌ Todo     | If user has no CV    |
| GET /cv/                  | CV overview page    | ⚠️ Scaffold | Display all sections |
| PATCH /cv/update          | Edit CV description | ❌ Todo     | Inline or modal      |
| POST /cv/set-public       | Toggle switch       | ❌ Todo     | Public/private       |
| POST /cv/enable           | Enable button       | ❌ Todo     | If disabled          |
| POST /cv/disable          | Disable button      | ❌ Todo     | Hide from others     |
| POST /cv/contact          | Add contact form    | ❌ Todo     | Modal                |
| GET /cv/contact           | Contact display     | ❌ Todo     | In CV page           |
| PATCH /cv/contact/{id}    | Edit contact        | ❌ Todo     | Inline edit          |
| POST /cv/formation        | Add formation form  | ❌ Todo     | Modal                |
| GET /cv/formations        | Formations list     | ❌ Todo     | Timeline view        |
| PATCH /cv/formation/{id}  | Edit formation      | ❌ Todo     | Modal                |
| POST /cv/competence       | Add competence      | ❌ Todo     | Tags input           |
| GET /cv/competences       | Competences list    | ❌ Todo     | Tag cloud            |
| PATCH /cv/competence/{id} | Edit competence     | ❌ Todo     | Inline edit          |
| POST /cv/langue           | Add langue          | ❌ Todo     | Form                 |
| GET /cv/langues           | Langues list        | ❌ Todo     | List with levels     |
| PATCH /cv/langue/{id}     | Edit langue         | ❌ Todo     | Inline edit          |
| POST /cv/experience       | Add experience      | ❌ Todo     | Form with dates      |
| GET /cv/experiences       | Experiences list    | ❌ Todo     | Timeline             |
| PATCH /cv/experience/{id} | Edit experience     | ❌ Todo     | Modal                |

### Connections (/connections)

| Endpoint                          | UI Component         | Status      | Notes                   |
| --------------------------------- | -------------------- | ----------- | ----------------------- |
| POST /connections/send            | Send request button  | ❌ Todo     | On user profiles        |
| POST /connections/{id}/accept     | Accept button        | ❌ Todo     | In pending requests     |
| POST /connections/{id}/reject     | Reject button        | ❌ Todo     | In pending requests     |
| GET /connections/accepted         | Connections tab      | ⚠️ Scaffold | Grid of users           |
| GET /connections/pending/incoming | Pending incoming tab | ❌ Todo     | List with accept/reject |
| GET /connections/pending/outgoing | Pending outgoing tab | ❌ Todo     | List with cancel option |
| DELETE /connections/{id}          | Remove connection    | ❌ Todo     | Confirmation dialog     |
| GET /connections/{user_id}/mutual | Mutual connections   | ❌ Todo     | On user profile         |

### Chats (/chats)

| Endpoint                   | UI Component       | Status      | Notes                 |
| -------------------------- | ------------------ | ----------- | --------------------- |
| POST /chats/message        | Send message form  | ❌ Todo     | Text input + button   |
| GET /chats                 | Chats list sidebar | ⚠️ Scaffold | List of conversations |
| GET /chats/{id}            | Chat thread        | ❌ Todo     | Messages display      |
| GET /chats/{id}/messages   | Same as above      | ❌ Todo     | Part of thread view   |
| POST /chats/with/{user_id} | Start chat button  | ❌ Todo     | On user profiles      |
| DELETE /chats/{id}         | Delete chat        | ❌ Todo     | Confirmation          |

**Implementation tip:** Split screen layout:

- Left: Chats list (GET /chats)
- Right: Selected chat thread (GET /chats/{id})
- Bottom: Send message form (POST /chats/message)

### Google Scholar (/google-scholar)

| Endpoint                                            | UI Component           | Status      | Notes                 |
| --------------------------------------------------- | ---------------------- | ----------- | --------------------- |
| POST /google-scholar/link                           | Link account form      | ❌ Todo     | Input for Scholar ID  |
| PUT /google-scholar/update                          | Update ID form         | ❌ Todo     | Similar to link       |
| GET /google-scholar/integration                     | Integration status     | ⚠️ Scaffold | Show if linked        |
| POST /google-scholar/sync                           | Sync button            | ❌ Todo     | Trigger sync          |
| GET /google-scholar/publications                    | Publications list      | ❌ Todo     | Table with pagination |
| GET /google-scholar/publications/{id}               | Publication detail     | ❌ Todo     | Modal or page         |
| PATCH /google-scholar/publications/{id}/toggle-post | Toggle posted checkbox | ❌ Todo     | In publications list  |
| DELETE /google-scholar/unlink                       | Unlink button          | ❌ Todo     | Confirmation          |

**Note:** Use `qrcode` library to display QR code for Scholar ID verification.

### Projets (/projets)

| Endpoint                | UI Component        | Status      | Notes             |
| ----------------------- | ------------------- | ----------- | ----------------- |
| POST /projets/          | Create projet form  | ❌ Todo     | Enseignant only   |
| GET /projets/my-projets | My Projects tab     | ❌ Todo     | Enseignant only   |
| GET /projets/           | All projects list   | ⚠️ Scaffold | Browse page       |
| GET /projets/search     | Search bar          | ❌ Todo     | Search input      |
| GET /projets/user/{id}  | User's projects     | ❌ Todo     | On user profile   |
| GET /projets/{id}       | Project detail page | ❌ Todo     | Full project info |
| PATCH /projets/{id}     | Edit project form   | ❌ Todo     | Owner only        |
| DELETE /projets/{id}    | Delete button       | ❌ Todo     | Owner only        |

**Filter:** Add dropdown to filter by `statut` query param.

---

## Implementation Priority

### Phase 1: Essential Features (Week 1-2)

1. **Complete Profile Page** - Required for new users
2. **Posts Feed** - Core social feature
3. **Create Post + Comments + Reactions** - Engagement
4. **Connections Management** - Networking
5. **CV Builder** - Professional profiles

### Phase 2: Communication (Week 3)

6. **Chat Interface** - Real-time messaging
7. **User Profiles** - View other users
8. **Search Users** - Find connections

### Phase 3: Advanced Features (Week 4)

9. **Projets Management** - Research projects
10. **Google Scholar Integration** - Academic credentials
11. **Settings Page** - 2FA management

### Phase 4: Admin Panel (Week 5)

12. **Organization Management** - All CRUD operations
13. **User Management** - Admin user controls
14. **Content Moderation** - Admin moderation
15. **Platform Statistics** - Analytics dashboard

---

## Code Patterns & Examples

### 1. List Page with Pagination

```tsx
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PostsList() {
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", "feed", skip],
    queryFn: () => postsApi.getFeed({ skip, limit }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {data?.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div className="flex gap-2">
        <Button
          onClick={() => setSkip((s) => Math.max(0, s - limit))}
          disabled={skip === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setSkip((s) => s + limit)}
          disabled={data?.posts.length < limit}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

### 2. Create Form with Validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api";
import { toast } from "sonner";

const schema = z.object({
  content: z.string().min(1, "Content is required"),
  attachement: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean(),
});

export function CreatePostForm() {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { content: "", attachement: "", isPublic: true },
  });

  const mutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created!");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed");
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <textarea {...form.register("content")} />
      {/* more fields */}
      <button disabled={mutation.isPending}>Create</button>
    </form>
  );
}
```

### 3. Delete Confirmation Dialog

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api";
import { toast } from "sonner";

export function DeletePostButton({ postId }: { postId: number }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteMutation.mutate()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4. Infinite Scroll

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { postsApi } from "@/api";
import { useEffect, useRef } from "react";

export function InfinitePostsFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", "feed"],
      queryFn: ({ pageParam = 0 }) =>
        postsApi.getFeed({ skip: pageParam, limit: 20 }),
      getNextPageParam: (lastPage, allPages) => {
        const totalFetched = allPages.reduce(
          (sum, page) => sum + page.posts.length,
          0,
        );
        return lastPage.posts.length === 20 ? totalFetched : undefined;
      },
      initialPageParam: 0,
    });

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return (
    <div>
      {data?.pages.map((page) =>
        page.posts.map((post) => <PostCard key={post.id} post={post} />),
      )}
      <div ref={observerTarget} />
      {isFetchingNextPage && <div>Loading more...</div>}
    </div>
  );
}
```

---

## Additional UI Components Needed

Install these additional shadcn/ui components as needed:

```bash
# For dialogs/modals
npx shadcn-ui@latest add dialog

# For alerts
npx shadcn-ui@latest add alert-dialog

# For tables
npx shadcn-ui@latest add table

# For tabs
npx shadcn-ui@latest add tabs

# For select dropdowns
npx shadcn-ui@latest add select

# For switches/toggles
npx shadcn-ui@latest add switch

# For avatars
npx shadcn-ui@latest add avatar

# For badges
npx shadcn-ui@latest add badge

# For dropdown menus
npx shadcn-ui@latest add dropdown-menu
```

---

## Testing Checklist

For each implemented feature:

- [ ] Displays loading state
- [ ] Handles errors gracefully
- [ ] Shows success toasts
- [ ] Form validation works
- [ ] Pagination/infinite scroll works
- [ ] Mobile responsive
- [ ] Protected by auth if required
- [ ] Role-based access enforced
- [ ] Optimistic updates (optional)
- [ ] Works with real backend data

---

## Next Steps

1. Run `npm install` in the frontend folder
2. Start backend: `cd backend && uvicorn main:app --reload`
3. Start frontend: `cd frontend && npm run dev`
4. Test login/register flows
5. Pick a feature from Phase 1 and implement following the patterns above
6. Test integration with backend
7. Move to next feature

**Good luck! The foundation is solid, now build feature by feature. 🚀**
