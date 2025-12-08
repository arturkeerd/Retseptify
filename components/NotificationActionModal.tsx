import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NotificationActionModalProps = {
  visible: boolean;
  onClose: () => void;
  onBackgroundPress: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export default function NotificationActionModal({
  visible,
  onClose,
  onBackgroundPress,
  onApprove,
  onReject,
}: NotificationActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
  style={styles.modalBackground}
  activeOpacity={1}
  onPress={onBackgroundPress}
/>

        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onApprove}
          >
            <Text style={styles.modalButtonText}>Muuda retsepti</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalRejectButton}
            onPress={onReject}
          >
            <Text style={styles.modalRejectText}>
              Ei tule välja nende kogustega
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.rejectIcon}
              onPress={onReject}
            >
              <Text style={styles.iconText}>✗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveIcon}
              onPress={onApprove}
            >
              <Text style={styles.iconText}>✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalButton: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  modalButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  modalRejectButton: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  modalRejectText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  modalActions: {
    flexDirection: "row",
    gap: 40,
  },
  rejectIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  approveIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#C8E6C9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
});