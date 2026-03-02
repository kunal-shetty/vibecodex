import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>Profile</Text>
      <Text style={s.sub}>Account settings will appear here.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" },
  title:     { fontSize: 24, fontWeight: "bold", color: "#fff" },
  sub:       { marginTop: 8, color: "#6b7280" },
});
