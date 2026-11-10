import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/auth/AuthContext";
import { API_URL } from "@/config";
import { colors } from "@/theme/colors";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const logout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <View style={styles.pad}>
      <Text style={styles.name}>{user?.firstName || user?.name || user?.email}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.meta}>API: {API_URL}</Text>
      <Pressable style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 20 },
  name: { fontSize: 22, fontWeight: "800", color: colors.brand950 },
  email: { marginTop: 4, fontSize: 15, color: "#6b7280" },
  meta: { marginTop: 16, fontSize: 12, color: "#9ca3af", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  btn: {
    marginTop: 32,
    borderWidth: 2,
    borderColor: colors.brand100,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: colors.brand800, fontWeight: "700", fontSize: 16 },
});
