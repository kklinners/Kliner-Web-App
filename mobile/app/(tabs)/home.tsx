import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { http, MyService } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { SERVICES } from "@/constants/services";
import { PRE_ARRIVAL_NOTICE, VISIT_CODE_OWNER_HINT_SHORT } from "@/lib/ownerSafety";
import { WEB_APP_URL } from "@/config";
import { colors } from "@/theme/colors";

export default function HomeScreen() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<MyService[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await http.get("/api/v1/services/my-services");
    const start = new Date().setHours(0, 0, 0, 0);
    const live = ["confirmed", "assigned", "accepted", "in_progress", "completion_requested"];
    const list = (data.data?.services || [])
      .filter((s: MyService) => live.includes(s.status) && new Date(s.bookingDate).getTime() >= start)
      .sort((a: MyService, b: MyService) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
      .slice(0, 3);
    setUpcoming(list);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const openBookingOnWeb = (path: string) => {
    WebBrowser.openBrowserAsync(`${WEB_APP_URL}${path}`).catch(() => {
      Alert.alert("Web booking", `Open ${WEB_APP_URL}${path} in your browser to finish this step on the web app for now.`);
    });
  };

  const name = user?.firstName || user?.name || "there";
  const today = new Date().toDateString();
  const showPreArrival = upcoming.some((b) => {
    const day = new Date(b.bookingDate).toDateString();
    return b.ownerSecurity?.teamLeadName && day === today && ["accepted", "in_progress"].includes(b.status);
  });

  return (
    <ScrollView
      contentContainerStyle={styles.pad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
    >
      <Text style={styles.greeting}>Hi {name}</Text>
      <Text style={styles.lead}>What do you need done today?</Text>

      {showPreArrival ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{PRE_ARRIVAL_NOTICE}</Text>
        </View>
      ) : null}

      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming up</Text>
          {upcoming.map((b) => (
            <View key={b.id} style={styles.bookingRow}>
              <Text style={styles.bookingTitle}>{b.serviceCategory || b.serviceName}</Text>
              <Text style={styles.bookingMeta}>
                {new Date(b.bookingDate).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}
                {b.bookingTime ? ` · ${b.bookingTime}` : ""}
              </Text>
              {b.partnerName ? <Text style={styles.team}>Team: {b.partnerName}</Text> : null}
              {b.ownerSecurity?.showVisitorCode && b.ownerSecurity.visitorCode ? (
                <Text style={styles.code}>
                  Visit code: <Text style={styles.codeDigits}>{b.ownerSecurity.visitorCode}</Text>
                  {"\n"}
                  <Text style={styles.codeHint}>{VISIT_CODE_OWNER_HINT_SHORT}</Text>
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Services</Text>
      <Text style={styles.webNote}>Full booking flow is on the web for now — we open it in your browser.</Text>
      <View style={styles.grid}>
        {SERVICES.map((s) => (
          <Pressable
            key={s.key}
            style={styles.serviceCard}
            onPress={() => openBookingOnWeb(`/booking/${s.key === "house_cleaning" ? "house-cleaning" : s.key}`)}
          >
            <Text style={styles.serviceName}>{s.name}</Text>
            <Text style={styles.serviceHint}>{s.hint}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 26, fontWeight: "800", color: colors.brand950 },
  lead: { marginTop: 4, marginBottom: 16, fontSize: 15, color: "#4b5563" },
  banner: {
    backgroundColor: colors.brand100,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#b8e0e0",
  },
  bannerText: { fontSize: 14, color: colors.brand950, lineHeight: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.brand950, marginBottom: 10 },
  bookingRow: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  bookingTitle: { fontSize: 16, fontWeight: "600", color: colors.brand950 },
  bookingMeta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  team: { fontSize: 13, fontWeight: "600", color: colors.brand700, marginTop: 4 },
  code: { fontSize: 13, marginTop: 8, color: colors.brand800, lineHeight: 18 },
  codeDigits: { fontWeight: "800", letterSpacing: 2 },
  codeHint: { fontSize: 12, color: "#6b7280" },
  webNote: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceCard: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  serviceName: { fontSize: 16, fontWeight: "700", color: colors.brand950 },
  serviceHint: { marginTop: 4, fontSize: 12, color: colors.brand600, fontWeight: "600" },
});
