import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { http, MyService } from "@/api/client";
import { VISIT_CODE_OWNER_HINT_SHORT } from "@/lib/ownerSafety";
import { colors } from "@/theme/colors";

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  confirmed: "Finding your team",
  assigned: "Team being assigned",
  accepted: "Team assigned",
  in_progress: "In progress",
  completion_requested: "Team finished — confirming",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<MyService[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await http.get("/api/v1/services/my-services");
    setBookings(data.data?.services || []);
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

  return (
    <ScrollView
      contentContainerStyle={styles.pad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
    >
      {bookings.length === 0 ? (
        <Text style={styles.empty}>No bookings yet. Start from Home → pick a service.</Text>
      ) : (
        bookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>{b.serviceCategory || b.serviceName}</Text>
              <Text style={styles.badge}>{STATUS_LABELS[b.status] || b.status}</Text>
            </View>
            <Text style={styles.meta}>
              {new Date(b.bookingDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              {b.bookingTime ? ` · ${b.bookingTime}` : ""}
            </Text>
            {b.partnerName ? <Text style={styles.team}>Team: {b.partnerName}</Text> : null}
            {b.ownerSecurity?.showVisitorCode && b.ownerSecurity.visitorCode ? (
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Visit code</Text>
                <Text style={styles.codeValue}>{b.ownerSecurity.visitorCode}</Text>
                <Text style={styles.codeHint}>{VISIT_CODE_OWNER_HINT_SHORT}</Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 20, paddingBottom: 40 },
  empty: { fontSize: 15, color: "#6b7280", lineHeight: 22 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.brand950 },
  badge: { fontSize: 11, fontWeight: "600", color: colors.brand700, maxWidth: "40%", textAlign: "right" },
  meta: { marginTop: 6, fontSize: 13, color: "#6b7280" },
  team: { marginTop: 6, fontSize: 13, fontWeight: "600", color: colors.brand700 },
  codeBox: {
    marginTop: 12,
    backgroundColor: colors.brand50,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  codeLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: colors.brand600 },
  codeValue: { fontSize: 28, fontWeight: "800", letterSpacing: 4, color: colors.brand950, marginVertical: 4 },
  codeHint: { fontSize: 12, color: "#6b7280", lineHeight: 17 },
});
