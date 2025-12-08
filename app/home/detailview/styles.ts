// app/home/detailview/styles.ts
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Ülemine fikseeritud ala (pilt + pealkiri)
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imageContainer: {
    height: 150,
    borderRadius: 16,
    backgroundColor: "#D9D9D9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholderInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 14,
  },
  headerRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Kaartide ala
  cardsScroll: {
    flex: 1,
  },
  cardsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  // Kirjelduse kaardi header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  // Expand/Collapse ikoon
  expandButton: {
    padding: 0,
  },
  expandIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  // Tooraine header – Valmistamise kogus + controls + expand ikoon
  servingsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  servingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  servingsLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  servingsControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  servingsIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  servingsIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  servingsInput: {
    width: 50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "#FFF",
  },

  // Koostisosad
  ingredientsListCollapsed: {
    maxHeight: 160,
    marginTop: 4,
  },
  ingredientsList: {
    marginTop: 4,
  },
  innerScroll: {
    flexGrow: 0,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  ingredientName: {
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },
  ingredientRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ingredientQty: {
    fontSize: 14,
    fontWeight: "500",
  },
  unitButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "#F8F8F8",
  },
  unitButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Kirjeldus
  descriptionCollapsed: {
    maxHeight: 160,
  },
  descriptionBox: {},
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Märksõnad / Köögid nupud
  tagsKitchensRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Ühiku modal
  unitModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  unitModalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFF",
  },
  unitModalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  unitOptionRow: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  unitOptionText: {
    fontSize: 14,
  },
  unitOptionDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  unitModalCancel: {
    marginTop: 12,
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  unitModalCancelText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Alumine rida – Edit/Chat + Home + Profiil
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default styles;
