import fs from "fs-extra";
import path from "path";

export async function scaffoldMobileTemplate(template, projectPath, options = {}) {
  const { projectName, supabaseUrl, supabaseAnonKey } = options;

  await writeBaseExpo(projectPath, projectName);

  switch (template) {
    case "mobile-social":   await writeMobileSocial(projectPath, options);  break;
    case "mobile-fitness":  await writeMobileFitness(projectPath, options); break;
    case "mobile-tasks":    await writeMobileTasks(projectPath, options);   break;
    case "mobile-food":     await writeMobileFood(projectPath, options);    break;
    case "mobile-ai":       await writeMobileAI(projectPath, options);      break;
    case "blank-mobile":
    default:                await writeMobileBlank(projectPath, options);   break;
  }

  await fs.outputFile(
    path.join(projectPath, ".env"),
    `EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl || "YOUR_SUPABASE_URL"}\nEXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey || "YOUR_SUPABASE_ANON_KEY"}\n`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE
// ─────────────────────────────────────────────────────────────────────────────
async function writeBaseExpo(dir, projectName) {
  // package.json — pinned versions that are mutually compatible
  await fs.outputJSON(path.join(dir, "package.json"), {
    name: projectName,
    version: "1.0.0",
    main: "expo-router/entry",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web",
    },
    dependencies: {
      "expo": "~51.0.28",
      "expo-router": "~3.5.23",
      "expo-status-bar": "~1.12.1",
      "expo-font": "~12.0.10",
      "expo-splash-screen": "~0.27.7",
      "expo-linking": "~6.3.1",
      "expo-constants": "~16.0.2",
      "react": "18.2.0",
      "react-native": "0.74.5",
      "react-native-safe-area-context": "4.10.5",
      "react-native-screens": "3.31.1",
      "react-native-reanimated": "~3.10.1",
      "@supabase/supabase-js": "^2.43.4",
      "react-native-url-polyfill": "^2.0.0",
      "@react-native-async-storage/async-storage": "1.23.1",
    },
    devDependencies: {
      "@babel/core": "^7.24.0",
      "@types/react": "~18.2.79",
      "typescript": "~5.3.3",
    },
  }, { spaces: 2 });

  // app.json — no asset references that don't exist
  await fs.outputJSON(path.join(dir, "app.json"), {
    expo: {
      name: projectName,
      slug: projectName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      version: "1.0.0",
      scheme: projectName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      orientation: "portrait",
      userInterfaceStyle: "automatic",
      assetBundlePatterns: ["**/*"],
      ios: { supportsTablet: true },
      android: { adaptiveIcon: { backgroundColor: "#0a0a0a" } },
      web: { bundler: "metro" },
      plugins: ["expo-router"],
      experiments: { typedRoutes: true },
    },
  }, { spaces: 2 });

  // babel.config.js — REQUIRED for Expo to start
  await fs.outputFile(path.join(dir, "babel.config.js"),
`module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
`);

  // tsconfig.json
  await fs.outputJSON(path.join(dir, "tsconfig.json"), {
    extends: "expo/tsconfig.base",
    compilerOptions: {
      strict: true,
      paths: { "@/*": ["./*"] },
    },
    include: ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"],
  }, { spaces: 2 });

  // expo-env.d.ts — required by tsconfig include
  await fs.outputFile(path.join(dir, "expo-env.d.ts"),
`/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore
`);

  // metro.config.js
  await fs.outputFile(path.join(dir, "metro.config.js"),
`const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
module.exports = config;
`);

  // lib/supabase.ts  (at root of project so @/lib/supabase works)
  await fs.outputFile(path.join(dir, "lib/supabase.ts"),
`import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
`);

  // components/Button.tsx
  await fs.outputFile(path.join(dir, "components/Button.tsx"),
`import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = "primary", style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, variant === "secondary" ? styles.secondary : styles.primary, style]}
    >
      <Text style={[styles.text, variant === "secondary" && styles.secText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: "center" },
  primary: { backgroundColor: "#6366f1" },
  secondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#4b5563" },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secText: { color: "#9ca3af" },
});
`);

  await fs.outputFile(path.join(dir, ".gitignore"),
`node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
.env
`);

  await fs.outputFile(path.join(dir, "README.md"),
`# ${projectName}

> Scaffolded with [VibeCodex](https://github.com/kunal-shetty/vibecodex) ⚡

## Getting Started

\`\`\`bash
npm install
npx expo start
\`\`\`

Scan the QR code with **Expo Go** on your phone, or press \`i\` / \`a\` for simulators.
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileSocial(dir) {
  // Root layout
  await fs.outputFile(path.join(dir, "app/_layout.tsx"),
`import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
`);

  // Tab layout
  await fs.outputFile(path.join(dir, "app/(tabs)/_layout.tsx"),
`import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "#1f2937" },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#6b7280",
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fff",
      }}
    >
      <Tabs.Screen name="index"         options={{ title: "Feed",          tabBarLabel: "Feed",    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text> }} />
      <Tabs.Screen name="explore"       options={{ title: "Explore",       tabBarLabel: "Explore", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔍</Text> }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications", tabBarLabel: "Alerts",  tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔔</Text> }} />
      <Tabs.Screen name="profile"       options={{ title: "Profile",       tabBarLabel: "Profile", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text> }} />
    </Tabs>
  );
}
`);

  // Feed
  await fs.outputFile(path.join(dir, "app/(tabs)/index.tsx"),
`import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEED = [
  { user: "Alice", handle: "@alice", time: "2m", content: "Just shipped a new feature! 🚀", likes: 24 },
  { user: "Bob",   handle: "@bob",   time: "10m", content: "Beautiful day for coding ☀️",   likes: 12 },
  { user: "Carol", handle: "@carol", time: "1h",  content: "Hot take: TypeScript is worth it 🔥", likes: 87 },
];

export default function FeedScreen() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.compose}>
          <TextInput placeholder="What's on your mind?" placeholderTextColor="#6b7280" style={s.input} multiline />
          <TouchableOpacity style={s.postBtn}><Text style={s.postBtnText}>Post</Text></TouchableOpacity>
        </View>
        {FEED.map((p, i) => (
          <View key={i} style={s.post}>
            <View style={s.avatar}><Text style={{ fontSize: 20 }}>😊</Text></View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
                <Text style={s.userName}>{p.user}</Text>
                <Text style={s.meta}>{p.handle} · {p.time}</Text>
              </View>
              <Text style={s.content}>{p.content}</Text>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                <Text style={s.meta}>❤️ {p.likes}</Text>
                <Text style={s.meta}>💬 Reply</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  compose: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  input: { color: "#fff", fontSize: 16, marginBottom: 12, minHeight: 60 },
  postBtn: { alignSelf: "flex-end", backgroundColor: "#6366f1", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  postBtnText: { color: "#fff", fontWeight: "600" },
  post: { flexDirection: "row", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center" },
  userName: { color: "#fff", fontWeight: "700" },
  meta: { color: "#6b7280", fontSize: 13 },
  content: { color: "#d1d5db", fontSize: 15, lineHeight: 22 },
});
`);

  // Explore (stub)
  await fs.outputFile(path.join(dir, "app/(tabs)/explore.tsx"),
`import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.center}>
        <Text style={s.emoji}>🔍</Text>
        <Text style={s.title}>Explore</Text>
        <Text style={s.sub}>Discover new content here</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  sub: { color: "#6b7280", fontSize: 15 },
});
`);

  // Notifications (stub)
  await fs.outputFile(path.join(dir, "app/(tabs)/notifications.tsx"),
`import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.center}>
        <Text style={s.emoji}>🔔</Text>
        <Text style={s.title}>All caught up!</Text>
        <Text style={s.sub}>No new notifications</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  sub: { color: "#6b7280", fontSize: 15 },
});
`);

  // Profile
  await fs.outputFile(path.join(dir, "app/(tabs)/profile.tsx"),
`import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.hero}>
          <View style={s.avatar}><Text style={{ fontSize: 40 }}>👤</Text></View>
          <Text style={s.name}>Your Name</Text>
          <Text style={s.handle}>@yourhandle</Text>
          <Text style={s.bio}>Building cool things ✨</Text>
          <View style={s.stats}>
            {[["0","Posts"],["0","Followers"],["0","Following"]].map(([v,l]) => (
              <View key={l} style={s.stat}>
                <Text style={s.statVal}>{v}</Text>
                <Text style={s.statLbl}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={s.signout}>
          <Text style={{ color: "#ef4444", fontWeight: "600" }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  hero: { alignItems: "center", padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  handle: { color: "#6b7280", marginBottom: 8 },
  bio: { color: "#9ca3af", marginBottom: 16 },
  stats: { flexDirection: "row", gap: 32 },
  stat: { alignItems: "center" },
  statVal: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  statLbl: { color: "#6b7280", fontSize: 12 },
  signout: { margin: 16, padding: 16, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: "#ef4444" },
});
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// FITNESS
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileFitness(dir) {
  await fs.outputFile(path.join(dir, "app/_layout.tsx"),
`import { Stack } from "expo-router";
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack>;
}
`);

  await fs.outputFile(path.join(dir, "app/(tabs)/_layout.tsx"),
`import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "#1f2937" },
      tabBarActiveTintColor: "#10b981",
      tabBarInactiveTintColor: "#6b7280",
      headerStyle: { backgroundColor: "#0a0a0a" },
      headerTintColor: "#fff",
    }}>
      <Tabs.Screen name="index"    options={{ title: "Today",    tabBarLabel: "Today",    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text> }} />
      <Tabs.Screen name="workouts" options={{ title: "Workouts", tabBarLabel: "Workouts", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💪</Text> }} />
      <Tabs.Screen name="progress" options={{ title: "Progress", tabBarLabel: "Progress", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📈</Text> }} />
      <Tabs.Screen name="profile"  options={{ title: "Profile",  tabBarLabel: "Profile",  tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text> }} />
    </Tabs>
  );
}
`);

  await fs.outputFile(path.join(dir, "app/(tabs)/index.tsx"),
`import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WORKOUTS = [
  { name: "Morning Run",         duration: "30 min", calories: 320, done: true,  icon: "🏃" },
  { name: "Upper Body Strength", duration: "45 min", calories: 280, done: false, icon: "💪" },
  { name: "Evening Yoga",        duration: "20 min", calories: 120, done: false, icon: "🧘" },
];

export default function TodayScreen() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.date}>{today}</Text>
        <Text style={s.heading}>Good morning! 💪</Text>
        <View style={s.ring}>
          <Text style={s.ringValue}>640</Text>
          <Text style={s.ringLabel}>cal burned</Text>
        </View>
        <View style={s.statsRow}>
          {[["1/3","Workouts"],["6,240","Steps"],["5.2h","Sleep"]].map(([v,l]) => (
            <View key={l} style={s.statCard}>
              <Text style={s.statVal}>{v}</Text>
              <Text style={s.statLbl}>{l}</Text>
            </View>
          ))}
        </View>
        <Text style={s.section}>Today's Plan</Text>
        {WORKOUTS.map((w) => (
          <TouchableOpacity key={w.name} style={[s.card, w.done && s.done]}>
            <Text style={{ fontSize: 28 }}>{w.icon}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[s.cardTitle, w.done && { color: "#6b7280" }]}>{w.name}</Text>
              <Text style={s.cardMeta}>{w.duration} · {w.calories} kcal</Text>
            </View>
            {w.done && <Text style={{ color: "#10b981", fontSize: 18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  date: { color: "#6b7280", fontSize: 13, marginBottom: 4 },
  heading: { color: "#fff", fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  ring: { backgroundColor: "#0d2818", borderRadius: 100, width: 160, height: 160, alignSelf: "center", alignItems: "center", justifyContent: "center", borderWidth: 8, borderColor: "#10b981", marginBottom: 20 },
  ringValue: { color: "#10b981", fontSize: 32, fontWeight: "bold" },
  ringLabel: { color: "#6b7280", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#111827", borderRadius: 16, padding: 14, alignItems: "center" },
  statVal: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  statLbl: { color: "#6b7280", fontSize: 11, marginTop: 4 },
  section: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 12 },
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 10 },
  done: { opacity: 0.6 },
  cardTitle: { color: "#fff", fontWeight: "600", fontSize: 15, marginBottom: 3 },
  cardMeta: { color: "#6b7280", fontSize: 12 },
});
`);

  // Stub tabs that are declared in _layout but need files
  for (const [name, emoji, label] of [["workouts","🏋️","Workouts"],["progress","📈","Progress"],["profile","👤","Profile"]]) {
    await fs.outputFile(path.join(dir, `app/(tabs)/${name}.tsx`),
`import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ${name.charAt(0).toUpperCase() + name.slice(1)}Screen() {
  return (
    <SafeAreaView style={s.c}>
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>${emoji}</Text>
        <Text style={s.title}>${label}</Text>
        <Text style={s.sub}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#0a0a0a" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  sub: { color: "#6b7280", fontSize: 15 },
});
`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileTasks(dir) {
  await fs.outputFile(path.join(dir, "app/_layout.tsx"),
`import { Stack } from "expo-router";
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack>;
}
`);

  await fs.outputFile(path.join(dir, "app/(tabs)/_layout.tsx"),
`import { Tabs } from "expo-router";
import { Text } from "react-native";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: "#111827" }, tabBarActiveTintColor: "#f59e0b", tabBarInactiveTintColor: "#6b7280", headerStyle: { backgroundColor: "#111827" }, headerTintColor: "#fff" }}>
      <Tabs.Screen name="index"    options={{ title: "Tasks",    tabBarLabel: "Tasks",    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✅</Text> }} />
      <Tabs.Screen name="projects" options={{ title: "Projects", tabBarLabel: "Projects", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📁</Text> }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar", tabBarLabel: "Calendar", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📅</Text> }} />
    </Tabs>
  );
}
`);

  await fs.outputFile(path.join(dir, "app/(tabs)/index.tsx"),
`import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Task { id: string; title: string; done: boolean; priority: "high" | "med" | "low"; }

const INITIAL: Task[] = [
  { id: "1", title: "Review pull request", done: false, priority: "high" },
  { id: "2", title: "Write unit tests",    done: false, priority: "med"  },
  { id: "3", title: "Update README",       done: true,  priority: "low"  },
];

const COLORS = { high: "#ef4444", med: "#f59e0b", low: "#6b7280" };

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [input, setInput] = useState("");

  const toggle = (id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const add = () => {
    if (!input.trim()) return;
    setTasks(p => [...p, { id: Date.now().toString(), title: input.trim(), done: false, priority: "med" }]);
    setInput("");
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.addRow}>
        <TextInput value={input} onChangeText={setInput} placeholder="Add a task..." placeholderTextColor="#6b7280" style={s.input} onSubmitEditing={add} returnKeyType="done" />
        <TouchableOpacity onPress={add} style={s.addBtn}><Text style={{ color: "#fff", fontWeight: "700", fontSize: 22 }}>+</Text></TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggle(item.id)} style={s.task}>
            <View style={[s.check, item.done && s.checked]}>
              {item.done && <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>}
            </View>
            <Text style={[s.taskText, item.done && s.strikethrough]}>{item.title}</Text>
            <View style={[s.badge, { backgroundColor: COLORS[item.priority] + "33" }]}>
              <Text style={{ color: COLORS[item.priority], fontSize: 10, fontWeight: "600" }}>{item.priority.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  addRow: { flexDirection: "row", gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  input: { flex: 1, backgroundColor: "#1f2937", color: "#fff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  addBtn: { backgroundColor: "#f59e0b", borderRadius: 12, width: 48, alignItems: "center", justifyContent: "center" },
  task: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 8, backgroundColor: "#1f2937", borderRadius: 14 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#4b5563", alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: "#10b981", borderColor: "#10b981" },
  taskText: { flex: 1, color: "#fff", fontSize: 15 },
  strikethrough: { textDecorationLine: "line-through", color: "#6b7280" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});
`);

  for (const [name, emoji, label] of [["projects","📁","Projects"],["calendar","📅","Calendar"]]) {
    await fs.outputFile(path.join(dir, `app/(tabs)/${name}.tsx`),
`import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ${name.charAt(0).toUpperCase() + name.slice(1)}Screen() {
  return (
    <SafeAreaView style={s.c}>
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>${emoji}</Text>
        <Text style={s.title}>${label}</Text>
        <Text style={s.sub}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#111827" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  sub: { color: "#6b7280", fontSize: 15 },
});
`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOD
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileFood(dir) {
  await fs.outputFile(path.join(dir, "app/_layout.tsx"),
`import { Stack } from "expo-router";
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack>;
}
`);

  await fs.outputFile(path.join(dir, "app/(tabs)/_layout.tsx"),
`import { Tabs } from "expo-router";
import { Text } from "react-native";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: "#fff" }, tabBarActiveTintColor: "#ef4444", tabBarInactiveTintColor: "#9ca3af", headerStyle: { backgroundColor: "#fff" }, headerTintColor: "#111" }}>
      <Tabs.Screen name="index"   options={{ title: "Home",    tabBarLabel: "Home",    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text> }} />
      <Tabs.Screen name="orders"  options={{ title: "Orders",  tabBarLabel: "Orders",  tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📦</Text> }} />
      <Tabs.Screen name="cart"    options={{ title: "Cart",    tabBarLabel: "Cart",    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛒</Text> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text> }} />
    </Tabs>
  );
}
`);

  await fs.outputFile(path.join(dir, "app/(tabs)/index.tsx"),
`import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = ["🍕 Pizza", "🍔 Burgers", "🍣 Sushi", "🥗 Salads", "🌮 Tacos", "🍜 Noodles"];
const RESTAURANTS = [
  { name: "Pizza Palace",   rating: 4.8, time: "20-30 min", delivery: "$1.99", emoji: "🍕" },
  { name: "Burger Barn",    rating: 4.6, time: "25-35 min", delivery: "Free",  emoji: "🍔" },
  { name: "Sushi Station",  rating: 4.9, time: "30-40 min", delivery: "$2.49", emoji: "🍣" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={s.greeting}>Good evening! 👋</Text>
          <Text style={s.heading}>What are you craving?</Text>
          <TextInput placeholder="Search..." placeholderTextColor="#9ca3af" style={s.search} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 20 }}>
          {CATEGORIES.map(c => <TouchableOpacity key={c} style={s.chip}><Text style={{ fontWeight: "600" }}>{c}</Text></TouchableOpacity>)}
        </ScrollView>
        <Text style={s.section}>Nearby Restaurants</Text>
        <View style={{ paddingHorizontal: 16 }}>
          {RESTAURANTS.map(r => (
            <TouchableOpacity key={r.name} style={s.card}>
              <View style={s.cardImg}><Text style={{ fontSize: 36 }}>{r.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{r.name}</Text>
                <Text style={s.cardMeta}>⭐ {r.rating} · {r.time} · {r.delivery} delivery</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  greeting: { color: "#6b7280", fontSize: 14, marginBottom: 4 },
  heading: { color: "#111", fontSize: 26, fontWeight: "bold", marginBottom: 14 },
  search: { backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: "#e5e7eb", color: "#111" },
  chip: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  section: { color: "#111", fontSize: 18, fontWeight: "bold", paddingHorizontal: 16, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", padding: 12 },
  cardImg: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center", marginRight: 12 },
  cardName: { color: "#111", fontWeight: "700", fontSize: 15, marginBottom: 4 },
  cardMeta: { color: "#6b7280", fontSize: 13 },
});
`);

  for (const [name, emoji, label, bg] of [["orders","📦","Your Orders","#f9fafb"],["cart","🛒","Your Cart","#f9fafb"],["profile","👤","Profile","#f9fafb"]]) {
    await fs.outputFile(path.join(dir, `app/(tabs)/${name}.tsx`),
`import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ${name.charAt(0).toUpperCase() + name.slice(1)}Screen() {
  return (
    <SafeAreaView style={s.c}>
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>${emoji}</Text>
        <Text style={s.title}>${label}</Text>
        <Text style={s.sub}>Nothing here yet</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "${bg}" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: "#111", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  sub: { color: "#6b7280", fontSize: 15 },
});
`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileAI(dir) {
  await fs.outputFile(path.join(dir, "app/_layout.tsx"),
`import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: "#0a0a0a" }, headerTintColor: "#fff", contentStyle: { backgroundColor: "#0a0a0a" } }}>
      <Stack.Screen name="index" options={{ title: "AI Assistant" }} />
    </Stack>
  );
}
`);

  await fs.outputFile(path.join(dir, "app/index.tsx"),
`import { useState, useRef } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Msg { id: string; role: "user" | "ai"; text: string; }

const INITIAL: Msg[] = [{ id: "0", role: "ai", text: "Hello! I'm your AI assistant. How can I help you today?" }];

export default function AIScreen() {
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { id: Date.now().toString(), role: "user", text: input };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    // TODO: replace with real API call
    await new Promise(r => setTimeout(r, 1000));
    setMsgs(p => [...p, { id: (Date.now() + 1).toString(), role: "ai", text: "This is a placeholder. Connect to OpenAI in the send() function!" }]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={i => i.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View style={[s.bubble, item.role === "user" ? s.userBubble : s.aiBubble]}>
              <Text style={[s.bubbleText, item.role === "ai" && s.aiText]}>{item.text}</Text>
            </View>
          )}
        />
        {loading && (
          <View style={[s.bubble, s.aiBubble, { marginHorizontal: 16, marginBottom: 8 }]}>
            <Text style={s.aiText}>Thinking...</Text>
          </View>
        )}
        <View style={s.inputRow}>
          <TextInput
            value={input} onChangeText={setInput} placeholder="Ask anything..."
            placeholderTextColor="#6b7280" style={s.input} multiline
            onSubmitEditing={send} returnKeyType="send"
          />
          <TouchableOpacity onPress={send} disabled={!input.trim() || loading} style={[s.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  bubble: { maxWidth: "80%", borderRadius: 18, padding: 14 },
  userBubble: { backgroundColor: "#4f46e5", alignSelf: "flex-end" },
  aiBubble: { backgroundColor: "#1f2937", alignSelf: "flex-start" },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  aiText: { color: "#d1d5db" },
  inputRow: { flexDirection: "row", gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: "#1f2937" },
  input: { flex: 1, backgroundColor: "#1f2937", color: "#fff", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, maxHeight: 120, fontSize: 15 },
  sendBtn: { backgroundColor: "#4f46e5", width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
});
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// BLANK
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileBlank(dir) {
  await fs.outputFile(path.join(dir, "app/_layout.tsx"),
`import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: "#0a0a0a" }, headerTintColor: "#fff", contentStyle: { backgroundColor: "#0a0a0a" } }}>
      <Stack.Screen name="index" options={{ title: "My App" }} />
    </Stack>
  );
}
`);

  await fs.outputFile(path.join(dir, "app/index.tsx"),
`import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <View style={s.container}>
      <Text style={s.emoji}>⚡</Text>
      <Text style={s.title}>Your App Starts Here</Text>
      <Text style={s.sub}>{"Scaffolded with VibeCodex\\nEdit app/index.tsx to begin."}</Text>
      <StatusBar style="light" />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", alignItems: "center", justifyContent: "center", padding: 24 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  sub: { color: "#6b7280", fontSize: 16, textAlign: "center", lineHeight: 24 },
});
`);
}
