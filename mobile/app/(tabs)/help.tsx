import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

const FAQ = [
  ["Visit code", "After we assign your team, a 6-digit code appears in Bookings. Share it only at the door; the crew enters it on their job page."],
  ["Belongings", "Keep personal items at the entrance. The team will not move them into the work area."],
  ["Report a problem", "Use WhatsApp or call Kliner with your booking reference — same as the web Help page."],
];

export default function HelpScreen() {
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.intro}>Answers and support for your bookings.</Text>
      {FAQ.map(([q, a]) => (
        <View key={q} style={styles.block}>
          <Text style={styles.q}>{q}</Text>
          <Text style={styles.a}>{a}</Text>
        </View>
      ))}
      <Pressable
        style={styles.btn}
        onPress={() => Linking.openURL("https://wa.me/2348000000000").catch(() => {})}
      >
        <Text style={styles.btnText}>Message on WhatsApp</Text>
      </Pressable>
      <Text style={styles.note}>Update the WhatsApp number in app/(tabs)/help.tsx to match utils/contact.js.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 20, paddingBottom: 40 },
  intro: { fontSize: 15, color: "#4b5563", marginBottom: 16 },
  block: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  q: { fontSize: 16, fontWeight: "700", color: colors.brand950 },
  a: { marginTop: 6, fontSize: 14, lineHeight: 20, color: "#4b5563" },
  btn: {
    marginTop: 8,
    backgroundColor: colors.brand600,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  note: { marginTop: 12, fontSize: 12, color: "#9ca3af" },
});
