import { StyleSheet, ViewStyle, TextStyle } from "react-native";

type Styles = {
  container: ViewStyle;
  listContent: ViewStyle;
  header: ViewStyle;
  headerButton: ViewStyle;
  headerButtonText: TextStyle;
  footer: ViewStyle;
  searchBox: ViewStyle;
  searchInput: TextStyle;
  footerRight: ViewStyle;
  circleButton: ViewStyle;
  circleButtonText: TextStyle;
  addButton: ViewStyle;
  addButtonText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 80, // ruum footerile
    backgroundColor: "#F4F1EC", // marble tausta aseaine
  },

  listContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  headerButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 10,
    backgroundColor: "#F5F9E9",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F9E9",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchInput: {
    fontSize: 14,
  },

  footerRight: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  circleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },

  addButton: {
    position: "absolute",
    right: 80,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#F5E2B8",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: "700",
  },
});

export default styles;
