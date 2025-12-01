import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";

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
  searchIcon: ImageStyle;
  circleButton: ViewStyle;
  circleButtonText: TextStyle;
  profileWrapper: ViewStyle;
  addRecipeButton: ViewStyle;
  addIconImage: ImageStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    paddingTop: 26,
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
    paddingVertical: 20,
    backgroundColor: "#F5F9E9",
    alignItems: "center",
    justifyContent: "center",
      // Drop shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    // Drop shadow (Android)
    elevation: 5,
    },
  headerButtonText: {
  fontSize: 14,
  fontWeight: "500",
  color: "#1F2933",
  textShadowColor: "rgba(0,0,0,0.15)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1,
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
    height: 74,
    borderRadius: 37,
    backgroundColor: "#F5F5DC",
    paddingHorizontal: 20,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#3E567D",
  },

  searchInput: {
    fontSize: 14,
    flex: 1,
  },

  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    resizeMode: "contain",
    opacity: 0.6,
  },

  footerRight: {
    marginLeft: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  circleButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },

  profileWrapper: {
  position: "relative",
  width: 100,
  height: 100,
  },

addRecipeButton: {
  position: "absolute",
  top: -70,        // tõstab + natuke profiilipildi kohale
  right: 15,       // nihuta vasak/parem, kuni Figma matchib
  width: 64,
  height: 64,
  borderRadius: 24,
  backgroundColor: "#ffffffff", // Figma kollakas nupp
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 4,
},

addIconImage: {
    width: 75,
    height: 75,
    resizeMode: "contain",
  },

});

export default styles;
