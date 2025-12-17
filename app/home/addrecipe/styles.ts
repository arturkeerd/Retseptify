import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderWidth: 10,
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  scrollContent: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 140,
  },

  // --- Image card ---
  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    alignItems: "center",
  },

  imagePickButton: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EDE2CC",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  photoIcon: { width: 28, height: 28 },
  imagePreview: { width: "100%", height: "100%" },

  imageHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#222",
    textAlign: "center",
  },

  // --- Title input (above servings) ---
  titleRow: {
    marginTop: 14,
    marginBottom: 10,
  },
  titleLabel: {
    fontSize: 12,
    color: "#222",
    fontWeight: "600",
    marginBottom: 6,
  },
  titleInput: {
    width: "100%",
    height: 34,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2D3B8",
    paddingHorizontal: 10,
    fontSize: 12,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // --- Servings row (label + input + delete) ---
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  servingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  servingsLabel: { fontSize: 12, color: "#222", fontWeight: "600" },

  // ✅ kitsam (5 numbrit max)
  qtyInput: {
    width: 42,
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2D3B8",
    textAlign: "center",
    paddingHorizontal: 4,
    paddingVertical: 0,
    fontSize: 12,
    includeFontPadding: false,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  deleteBtn: {
    width: 38,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E2D3B8",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  deleteIcon: {
    width: 18,
    height: 18,
  },

  // --- Pills row ---
  pillsRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  pill: {
    width: 120,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2D3B8",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#222",
  },

  // --- Error text ---
  saveErrText: {
    marginTop: 8,
    color: "#b00020",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },

  // --- Saving overlay ---
  savingOverlay: {
    position: "absolute",
    top: 18,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  savingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#222",
  },

  // --- Bottom buttons row ---
  bottomRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 18,
  },
});

export default styles;
