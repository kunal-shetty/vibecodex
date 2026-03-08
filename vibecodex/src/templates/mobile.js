import fs from "fs-extra";
import path from "path";

/**
 * Scaffold a mobile (Expo) template into the given directory.
 */
export async function scaffoldMobileTemplate(template, projectPath, options = {}) {
  const { projectName, supabaseUrl, supabaseAnonKey } = options;

  // Write base Expo files
  await writeBaseExpo(projectPath, projectName);

  // Template-specific screens
  switch (template) {
    case "mobile-social":
      await writeMobileSocial(projectPath, options);
      break;
    case "mobile-fitness":
      await writeMobileFitness(projectPath, options);
      break;
    case "mobile-tasks":
      await writeMobileTasks(projectPath, options);
      break;
    case "mobile-food":
      await writeMobileFood(projectPath, options);
      break;
    case "mobile-ai":
      await writeMobileAI(projectPath, options);
      break;
    case "blank-mobile":
    default:
      await writeMobileBlank(projectPath, options);
      break;
  }

  // .env
  await fs.outputFile(
    path.join(projectPath, ".env"),
    `EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl || "YOUR_SUPABASE_URL"}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey || "YOUR_SUPABASE_ANON_KEY"}
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE EXPO FILES
// ─────────────────────────────────────────────────────────────────────────────

async function writeBaseExpo(dir, projectName) {
  await fs.outputJSON(
    path.join(dir, "package.json"),
    {
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
        expo: "~51.0.0",
        "expo-router": "~3.5.0",
        "expo-status-bar": "~1.12.1",
        "expo-font": "~12.0.4",
        "expo-splash-screen": "~0.27.0",
        "react": "18.2.0",
        "react-native": "0.74.0",
        "@supabase/supabase-js": "^2.43.4",
        "react-native-url-polyfill": "^2.0.0",
        "@react-native-async-storage/async-storage": "1.23.1",
        "react-native-reanimated": "~3.10.0",
        "react-native-safe-area-context": "4.10.1",
        "react-native-screens": "3.31.1",
      },
      devDependencies: {
        "@babel/core": "^7.20.0",
        "@types/react": "~18.2.79",
        typescript: "~5.3.3",
      },
    },
    { spaces: 2 }
  );

  await fs.outputJSON(
    path.join(dir, "app.json"),
    {
      expo: {
        name: projectName,
        slug: projectName.toLowerCase().replace(/\s+/g, "-"),
        version: "1.0.0",
        scheme: projectName.toLowerCase(),
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "automatic",
        splash: { image: "./assets/splash.png", resizeMode: "contain", backgroundColor: "#0a0a0a" },
        assetBundlePatterns: ["**/*"],
        ios: { supportsTablet: true },
        android: { adaptiveIcon: { foregroundImage: "./assets/adaptive-icon.png", backgroundColor: "#0a0a0a" } },
        plugins: ["expo-router"],
      },
    },
    { spaces: 2 }
  );

  await fs.outputFile(
    path.join(dir, "tsconfig.json"),
    JSON.stringify({ extends: "expo/tsconfig.base", compilerOptions: { strict: true }, include: ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"] }, null, 2)
  );

  await fs.outputFile(
    path.join(dir, "src/lib/supabase.ts"),
    `import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
`
  );

  // Shared components
  await fs.outputFile(
    path.join(dir, "src/components/ThemedText.tsx"),
    `import { Text, TextProps, StyleSheet } from "react-native";
export function ThemedText({ style, ...rest }: TextProps) {
  return <Text style={[styles.default, style]} {...rest} />;
}
const styles = StyleSheet.create({ default: { color: "#fff", fontSize: 16 } });
`
  );

  await fs.outputFile(
    path.join(dir, "src/components/ThemedView.tsx"),
    `import { View, ViewProps, StyleSheet } from "react-native";
export function ThemedView({ style, ...rest }: ViewProps) {
  return <View style={[styles.default, style]} {...rest} />;
}
const styles = StyleSheet.create({ default: { backgroundColor: "#0a0a0a" } });
`
  );

  await fs.outputFile(
    path.join(dir, "src/components/Button.tsx"),
    `import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
interface ButtonProps { title: string; onPress: () => void; variant?: "primary" | "secondary"; style?: ViewStyle; }
export function Button({ title, onPress, variant = "primary", style }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, variant === "secondary" ? styles.secondary : styles.primary, style]}>
      <Text style={[styles.text, variant === "secondary" ? styles.secText : null]}>{title}</Text>
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
`
  );

  await fs.outputFile(
    path.join(dir, ".gitignore"),
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
`
  );

  await fs.outputFile(
    path.join(dir, "README.md"),
    `# ${projectName}

> Scaffolded with [VibeCodex](https://github.com/kunal-shetty/vibecodex) ⚡

## Getting Started

\`\`\`bash
npm install
npx expo start
\`\`\`

Scan the QR code with Expo Go on your phone, or press \`i\` for iOS Simulator / \`a\` for Android.
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Social App
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileSocial(dir, opts) {
  await fs.outputFile(
    path.join(dir, "app/(tabs)/_layout.tsx"),
    `import { Tabs } from "expo-router";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "#1f2937" }, tabBarActiveTintColor: "#6366f1", tabBarInactiveTintColor: "#6b7280", headerStyle: { backgroundColor: "#0a0a0a" }, headerTintColor: "#fff" }}>
      <Tabs.Screen name="index" options={{ title: "Feed", tabBarLabel: "Feed" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore", tabBarLabel: "Explore" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications", tabBarLabel: "Alerts" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "app/(tabs)/index.tsx"),
    `import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEED = [
  { user: "Alice", handle: "@alice", time: "2m", content: "Just shipped a new feature! 🚀", likes: 24 },
  { user: "Bob", handle: "@bob", time: "10m", content: "Beautiful day for coding ☀️", likes: 12 },
  { user: "Carol", handle: "@carol", time: "1h", content: "Hot take: TypeScript is worth it 🔥", likes: 87 },
];

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.compose}>
          <TextInput placeholder="What's on your mind?" placeholderTextColor="#6b7280" style={styles.input} multiline />
          <TouchableOpacity style={styles.postBtn}><Text style={styles.postBtnText}>Post</Text></TouchableOpacity>
        </View>
        {FEED.map((p, i) => (
          <View key={i} style={styles.post}>
            <View style={styles.avatar}><Text style={{ fontSize: 20 }}>😊</Text></View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
                <Text style={styles.userName}>{p.user}</Text>
                <Text style={styles.meta}>{p.handle} · {p.time}</Text>
              </View>
              <Text style={styles.content}>{p.content}</Text>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                <Text style={styles.meta}>❤️ {p.likes}</Text>
                <Text style={styles.meta}>💬 Reply</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
`
  );

  await fs.outputFile(
    path.join(dir, "app/(tabs)/profile.tsx"),
    `import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/src/lib/supabase";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={{ fontSize: 40 }}>👤</Text></View>
          <Text style={styles.name}>Your Name</Text>
          <Text style={styles.handle}>@yourhandle</Text>
          <Text style={styles.bio}>Building cool things ✨</Text>
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statVal}>0</Text><Text style={styles.statLabel}>Posts</Text></View>
            <View style={styles.stat}><Text style={styles.statVal}>0</Text><Text style={styles.statLabel}>Followers</Text></View>
            <View style={styles.stat}><Text style={styles.statVal}>0</Text><Text style={styles.statLabel}>Following</Text></View>
          </View>
        </View>
        <TouchableOpacity style={styles.signout} onPress={() => supabase.auth.signOut()}>
          <Text style={{ color: "#ef4444", fontWeight: "600" }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  hero: { alignItems: "center", padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  handle: { color: "#6b7280", marginBottom: 8 },
  bio: { color: "#9ca3af", marginBottom: 16 },
  stats: { flexDirection: "row", gap: 32 },
  stat: { alignItems: "center" },
  statVal: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  statLabel: { color: "#6b7280", fontSize: 12 },
  signout: { margin: 16, padding: 16, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: "#ef4444" },
});
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Fitness Tracker
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileFitness(dir, opts) {
  await fs.outputFile(
    path.join(dir, "app/(tabs)/_layout.tsx"),
    `import { Tabs } from "expo-router";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "#1f2937" }, tabBarActiveTintColor: "#10b981", tabBarInactiveTintColor: "#6b7280", headerStyle: { backgroundColor: "#0a0a0a" }, headerTintColor: "#fff" }}>
      <Tabs.Screen name="index" options={{ title: "Today", tabBarLabel: "Today" }} />
      <Tabs.Screen name="workouts" options={{ title: "Workouts", tabBarLabel: "Workouts" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress", tabBarLabel: "Progress" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "app/(tabs)/index.tsx"),
    `import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TODAY_WORKOUTS = [
  { name: "Morning Run", duration: "30 min", calories: 320, done: true, icon: "🏃" },
  { name: "Upper Body Strength", duration: "45 min", calories: 280, done: false, icon: "💪" },
  { name: "Evening Yoga", duration: "20 min", calories: 120, done: false, icon: "🧘" },
];

export default function TodayScreen() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.date}>{today}</Text>
        <Text style={styles.heading}>Good morning! 💪</Text>
        <View style={styles.ring}>
          <Text style={styles.ringValue}>640</Text>
          <Text style={styles.ringLabel}>calories burned</Text>
        </View>
        <View style={styles.statsRow}>
          {[{ val: "1/3", lbl: "Workouts" }, { val: "6,240", lbl: "Steps" }, { val: "5.2h", lbl: "Sleep" }].map((s) => (
            <View key={s.lbl} style={styles.statCard}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Today's Plan</Text>
        {TODAY_WORKOUTS.map((w) => (
          <TouchableOpacity key={w.name} style={[styles.workoutCard, w.done && styles.done]}>
            <Text style={{ fontSize: 28 }}>{w.icon}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.workoutName, w.done && { color: "#6b7280" }]}>{w.name}</Text>
              <Text style={styles.workoutMeta}>{w.duration} · {w.calories} kcal</Text>
            </View>
            {w.done && <Text style={{ color: "#10b981", fontSize: 18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
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
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 12 },
  workoutCard: { backgroundColor: "#111827", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 10 },
  done: { opacity: 0.6 },
  workoutName: { color: "#fff", fontWeight: "600", fontSize: 15, marginBottom: 3 },
  workoutMeta: { color: "#6b7280", fontSize: 12 },
});
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Task Manager
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileTasks(dir, opts) {
  await fs.outputFile(
    path.join(dir, "app/(tabs)/_layout.tsx"),
    `import { Tabs } from "expo-router";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: "#111827" }, tabBarActiveTintColor: "#f59e0b", tabBarInactiveTintColor: "#6b7280", headerStyle: { backgroundColor: "#111827" }, headerTintColor: "#fff" }}>
      <Tabs.Screen name="index" options={{ title: "Tasks", tabBarLabel: "Tasks" }} />
      <Tabs.Screen name="projects" options={{ title: "Projects", tabBarLabel: "Projects" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar", tabBarLabel: "Calendar" }} />
    </Tabs>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "app/(tabs)/index.tsx"),
    `import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Task { id: string; title: string; done: boolean; priority: "high" | "med" | "low"; }

const INITIAL: Task[] = [
  { id: "1", title: "Review pull request", done: false, priority: "high" },
  { id: "2", title: "Write unit tests", done: false, priority: "med" },
  { id: "3", title: "Update README", done: true, priority: "low" },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [input, setInput] = useState("");

  const toggle = (id: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const add = () => {
    if (!input.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now().toString(), title: input.trim(), done: false, priority: "med" }]);
    setInput("");
  };

  const COLORS = { high: "#ef4444", med: "#f59e0b", low: "#6b7280" };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.addRow}>
        <TextInput value={input} onChangeText={setInput} placeholder="Add a task..." placeholderTextColor="#6b7280" style={styles.input} onSubmitEditing={add} />
        <TouchableOpacity onPress={add} style={styles.addBtn}><Text style={{ color: "#fff", fontWeight: "700", fontSize: 20 }}>+</Text></TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggle(item.id)} style={styles.task}>
            <View style={[styles.check, item.done && styles.checked]}>{item.done && <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>}</View>
            <Text style={[styles.taskText, item.done && styles.done]}>{item.title}</Text>
            <View style={[styles.priority, { backgroundColor: COLORS[item.priority] + "33" }]}>
              <Text style={{ color: COLORS[item.priority], fontSize: 10, fontWeight: "600" }}>{item.priority.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  addRow: { flexDirection: "row", gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  input: { flex: 1, backgroundColor: "#1f2937", color: "#fff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  addBtn: { backgroundColor: "#f59e0b", borderRadius: 12, width: 48, alignItems: "center", justifyContent: "center" },
  task: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 8, backgroundColor: "#1f2937", borderRadius: 14 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#4b5563", alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: "#10b981", borderColor: "#10b981" },
  taskText: { flex: 1, color: "#fff", fontSize: 15 },
  done: { textDecorationLine: "line-through", color: "#6b7280" },
  priority: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Food Delivery
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileFood(dir, opts) {
  await fs.outputFile(
    path.join(dir, "app/(tabs)/_layout.tsx"),
    `import { Tabs } from "expo-router";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: "#fff" }, tabBarActiveTintColor: "#ef4444", tabBarInactiveTintColor: "#9ca3af", headerStyle: { backgroundColor: "#fff" }, headerTintColor: "#111" }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarLabel: "Orders" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarLabel: "Cart" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "app/(tabs)/index.tsx"),
    `import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = ["🍕 Pizza", "🍔 Burgers", "🍣 Sushi", "🥗 Salads", "🌮 Tacos", "🍜 Noodles"];
const RESTAURANTS = [
  { name: "Pizza Palace", rating: 4.8, time: "20-30 min", delivery: "$1.99", emoji: "🍕" },
  { name: "Burger Barn", rating: 4.6, time: "25-35 min", delivery: "Free", emoji: "🍔" },
  { name: "Sushi Station", rating: 4.9, time: "30-40 min", delivery: "$2.49", emoji: "🍣" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={styles.greeting}>Good evening! 👋</Text>
          <Text style={styles.heading}>What are you craving?</Text>
          <TextInput placeholder="Search restaurants or dishes..." placeholderTextColor="#9ca3af" style={styles.search} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 20 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} style={styles.catChip}><Text style={{ fontWeight: "600" }}>{c}</Text></TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
        <View style={{ paddingHorizontal: 16 }}>
          {RESTAURANTS.map((r) => (
            <TouchableOpacity key={r.name} style={styles.restCard}>
              <View style={styles.restImg}><Text style={{ fontSize: 40 }}>{r.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.restName}>{r.name}</Text>
                <Text style={styles.restMeta}>⭐ {r.rating} · {r.time} · {r.delivery} delivery</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  greeting: { color: "#6b7280", fontSize: 14, marginBottom: 4 },
  heading: { color: "#111", fontSize: 26, fontWeight: "bold", marginBottom: 14 },
  search: { backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: "#e5e7eb", color: "#111" },
  catChip: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  sectionTitle: { color: "#111", fontSize: 18, fontWeight: "bold", paddingHorizontal: 16, marginBottom: 12 },
  restCard: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 14, overflow: "hidden", borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", padding: 12 },
  restImg: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center", marginRight: 12 },
  restName: { color: "#111", fontWeight: "700", fontSize: 15, marginBottom: 4 },
  restMeta: { color: "#6b7280", fontSize: 13 },
});
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: AI Assistant
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileAI(dir, opts) {
  await fs.outputFile(
    path.join(dir, "app/_layout.tsx"),
    `import { Stack } from "expo-router";
export default function RootLayout() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: "#0a0a0a" }, headerTintColor: "#fff", contentStyle: { backgroundColor: "#0a0a0a" } }}><Stack.Screen name="index" options={{ title: "AI Assistant" }} /></Stack>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "app/index.tsx"),
    `import { useState, useRef } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Msg { id: string; role: "user" | "ai"; text: string; }

export default function AIScreen() {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: "0", role: "ai", text: "Hello! I'm your AI assistant. How can I help you today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { id: Date.now().toString(), role: "user", text: input };
    setMsgs((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    // Simulate AI response — replace with actual API call
    await new Promise((r) => setTimeout(r, 1000));
    setMsgs((p) => [...p, { id: (Date.now() + 1).toString(), role: "ai", text: "This is a placeholder response. Connect to your AI API in the send function!" }]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={ref}
          data={msgs}
          keyExtractor={(i) => i.id}
          onContentSizeChange={() => ref.current?.scrollToEnd()}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, item.role === "ai" && styles.aiText]}>{item.text}</Text>
            </View>
          )}
        />
        {loading && (
          <View style={[styles.bubble, styles.aiBubble, { marginHorizontal: 16, marginBottom: 8, alignSelf: "flex-start" }]}>
            <Text style={styles.aiText}>Thinking...</Text>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput value={input} onChangeText={setInput} placeholder="Ask anything..." placeholderTextColor="#6b7280" style={styles.input} multiline />
          <TouchableOpacity onPress={send} disabled={!input.trim() || loading} style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
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
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Blank Mobile
// ─────────────────────────────────────────────────────────────────────────────
async function writeMobileBlank(dir, opts) {
  await fs.outputFile(
    path.join(dir, "app/_layout.tsx"),
    `import { Stack } from "expo-router";
export default function RootLayout() {
  return <Stack><Stack.Screen name="index" options={{ title: "My App" }} /></Stack>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "app/index.tsx"),
    `import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.title}>Your App Starts Here</Text>
      <Text style={styles.sub}>Scaffolded with VibeCodex{"\n"}Edit app/index.tsx to begin.</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", alignItems: "center", justifyContent: "center", padding: 24 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  sub: { color: "#6b7280", fontSize: 16, textAlign: "center", lineHeight: 24 },
});
`
  );
}
