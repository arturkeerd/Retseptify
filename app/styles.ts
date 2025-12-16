import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  flex: { flex: 1 },

  // full-screen background
  bg: {
    flex: 1,
  },

  // center everything like figma
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: 280,
    height: 190,
  },

  // form block width similar to figma
  form: {
    width: "100%",
    maxWidth: 340,
    gap: 16,
    alignItems: "center",
  },

  input: {
    width: "100%",
    backgroundColor: "#F5F7E8",
    borderWidth: 1.5,
    borderColor: "#3F342E",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2B2B2B",
  },

  placeholder: {
    color: "#6B6B6B",
  },

  errorText: {
    color: "#c62828",
    textAlign: "center",
    width: "100%",
    marginTop: -6,
  },

  btn: {
    width: 140,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#3F342E",
    backgroundColor: "#F5F7E8",
  },

  btnPrimary: {
    marginTop: 6,
  },

  btnSecondary: {
    marginTop: 6,
  },

  btnText: {
    fontWeight: "700",
    color: "#3F342E",
    fontSize: 15,
  },

  btnPressed: {
    opacity: 0.85,
  },

  btnDisabled: {
    opacity: 0.6,
  },
});
