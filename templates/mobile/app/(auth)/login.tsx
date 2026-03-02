import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) Alert.alert("Error", error.message);
    else setSent(true);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Welcome back</Text>
      <Text style={s.sub}>Sign in to continue</Text>

      {sent ? (
        <View style={s.sentBox}>
          <Text style={s.sentText}>✔ Check your email for a magic link</Text>
        </View>
      ) : (
        <>
          <TextInput
            style={s.input}
            placeholder="your@email.com"
            placeholderTextColor="#4b5563"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handleMagicLink} disabled={loading}>
            <Text style={s.btnText}>{loading ? "Sending..." : "Send magic link"}</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", padding: 32 },
  title:     { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  sub:       { fontSize: 15, color: "#6b7280", marginBottom: 32 },
  input:     { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 15, marginBottom: 12 },
  btn:       { backgroundColor: "#7c3aed", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnOff:    { opacity: 0.5 },
  btnText:   { color: "#fff", fontWeight: "600", fontSize: 16 },
  sentBox:   { backgroundColor: "rgba(52,211,153,0.1)", borderWidth: 1, borderColor: "rgba(52,211,153,0.3)", borderRadius: 12, padding: 16 },
  sentText:  { color: "#34d399", textAlign: "center" },
});
