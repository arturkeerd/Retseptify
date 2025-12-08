import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E6E1",
    paddingBottom: 40, 
  },
  listContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
  },
 notificationItem: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 6,
  paddingHorizontal: 20,
  borderRadius: 16,
  marginBottom: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
  unreadDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#FF0000',
  position: 'absolute',
  left: 8,
  top: '50%',
  marginTop: -5,
},
  recipeName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  userImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  leftSide: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: 10,
  },
  centerSide: {
    flex: 1,
    alignItems: "center",
  },
  rightSide: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 10,
  },
  profileButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(169, 149, 108, 0.75)",
    borderWidth: 3,
    borderColor: "#5D4037",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8E4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#9B8FE8",
  },
  
});

export default styles;