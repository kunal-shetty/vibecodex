import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={s.container}>
      <View style={s.badge}>
        <View style={s.dot} />
        <Text style={s.badgeText}>VibeCodex App</Text>
      </View>
      <Text style={s.title}>Your app is{"\n"}ready to build.</Text>
      <Text style={s.sub}>Supabase, auth and navigation{"\n"}are all configured.</Text>
      <TouchableOpacity style={s.btn} onPress={() => router.push("/(auth)/login")}>
        <Text style={s.btnText}>Get Started →</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center", padding: 32 },
  badge:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(168,85,247,0.1)", borderWidth: 1, borderColor: "rgba(168,85,247,0.3)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginBottom: 28 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: "#a855f7" },
  badgeText:  { color: "#c084fc", fontSize: 12, fontWeight: "500" },
  title:      { fontSize: 36, fontWeight: "bold", color: "#fff", textAlign: "center", lineHeight: 44, marginBottom: 14 },
  sub:        { fontSize: 15, color: "#6b7280", textAlign: "center", lineHeight: 22, marginBottom: 36 },
  btn:        { backgroundColor: "#7c3aed", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText:    { color: "#fff", fontWeight: "600", fontSize: 16 },
});
