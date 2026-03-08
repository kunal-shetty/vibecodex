# VibeCodex Agent Prompts 🤖

AI prompts to accelerate your VibeCodex project. Copy & paste into Claude, ChatGPT, Gemini, or GitHub Copilot.

---

## 🌐 Web Templates (Next.js)

### SaaS Starter
**Extend the dashboard with subscription tiers:**
> "I am using the VibeCodex SaaS Starter (Next.js App Router, Supabase, Tailwind). Add a `/dashboard/billing` page that reads the user's `plan` field from the `profiles` table and shows upgrade options. Use a dark slate theme with purple accents."

**Add a settings page:**
> "Add a `/dashboard/settings` page to my VibeCodex SaaS app with sections for Profile, Password, and Notifications. Fetch the user from Supabase, allow updating `full_name` and `avatar_url`. Style with glassmorphism cards on dark background."

---

### AI Chat App
**Add streaming responses:**
> "Update my VibeCodex AI Chat app's `/api/chat/route.ts` to use OpenAI streaming (ReadableStream). Update the client in `src/app/page.tsx` to render tokens as they stream in using the Vercel AI SDK pattern."

**Add chat history with Supabase:**
> "Add persistent chat history to my VibeCodex AI Chat app. Create a sidebar that lists past sessions from `chat_sessions` table, fetching with Supabase. Clicking a session loads its messages from `chat_messages`."

---

### E-commerce Store
**Add a product detail page:**
> "Create a `/products/[id]/page.tsx` in my VibeCodex e-commerce app. Fetch product data from Supabase, show a large image, description, price, and an 'Add to Cart' button. Add a quantity selector component."

**Integrate Stripe Checkout:**
> "Add a Stripe Checkout flow to my VibeCodex store. Create `/api/checkout/route.ts` that creates a Stripe session, and a `/success` page that confirms the order and updates Supabase `orders` table status to `paid`."

---

### Blog / CMS
**Add an admin editor:**
> "Create a protected `/admin/posts/new` page in my VibeCodex blog. Include a rich text editor (use `@uiw/react-md-editor`) for writing markdown, a cover image uploader using Supabase Storage, and a publish/draft toggle. Only allow access for authenticated users."

**Add a newsletter signup:**
> "Add a newsletter signup section at the bottom of each blog post in my VibeCodex CMS. Store emails in a `subscribers` Supabase table. Show a success animation using Framer Motion."

---

### Social Platform
**Add real-time feed updates:**
> "Update the feed in my VibeCodex social app to use Supabase Realtime subscriptions. New posts from followed users should appear at the top of the feed without refreshing. Use `supabase.channel()` and show a 'New posts available' banner."

**Add an image upload for posts:**
> "Add image upload functionality to the compose box in my VibeCodex social app. Use Supabase Storage bucket `post-images`. Show a preview thumbnail before posting, and display images inline in the feed."

---

### Analytics Dashboard
**Add live Recharts graphs:**
> "Replace the placeholder charts in my VibeCodex Analytics dashboard with real Recharts components. Add a `LineChart` showing daily active users for the last 30 days (fetched from Supabase `events` table grouped by date), and a `BarChart` for top events."

---

## 📱 Mobile Templates (Expo)

### Social App
**Add a stories bar:**
> "Add a horizontal stories bar at the top of the feed in my VibeCodex Expo social app. Use React Native `ScrollView` horizontal. Each story should show an avatar with a gradient ring. Tapping opens a fullscreen story viewer using `expo-router` modal."

---

### Fitness Tracker
**Add a workout timer:**
> "Add an active workout screen to my VibeCodex fitness app. It should show a countdown timer using `react-native-reanimated`, a list of exercises with set/rep counters, and a 'Complete Workout' button that saves the session to Supabase."

---

### Task Manager
**Add drag-to-reorder:**
> "Add drag-and-drop reordering to my VibeCodex task list using `react-native-draggable-flatlist`. Persist the order with a `position` field in Supabase. Show a smooth drag handle on each task row."

---

### AI Assistant
**Add voice input:**
> "Add voice-to-text input to my VibeCodex AI assistant app using `expo-speech` and `@react-native-voice/voice`. Show a pulsing microphone button. Transcribe the user's speech, populate the text input, then auto-send."

---

## ⚡ Universal Pro Tips

- **Context is Key**: Always mention VibeCodex, Next.js App Router / Expo Router, Supabase, and your specific template.
- **Paste Errors**: Copy the exact TypeScript or lint error into the AI — it knows the codebase structure.
- **Component Splitting**: Ask the AI to split large components into smaller client/server pieces for Next.js.
- **Schema First**: For new features, ask the AI to write the Supabase SQL schema and RLS policies before the UI.
- **Type Safety**: Ask for Supabase type generation: `supabase gen types typescript --project-id YOUR_ID > src/lib/database.types.ts`
