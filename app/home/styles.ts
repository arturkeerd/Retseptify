import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  flex: { flex: 1 },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12, // kui häirib, võid eemaldada ja kasutada marginTop
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  text: { fontSize: 14 },

  errorText: { color: "#c62828", textAlign: "center", marginTop: 6 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 12,
  },
});
