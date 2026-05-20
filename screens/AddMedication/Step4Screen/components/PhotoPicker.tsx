import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../../components/Text";
import * as ImagePicker from "expo-image-picker";
import ImageIcon from "../../../../assets/icons/image.svg";
import { Colors } from "../../../../constants/theme";
import BaseModal from "../../../../components/BaseModal";

type Props = {
  uri: string | null;
  onChange: (uri: string | null) => void;
};

export const PhotoPicker = ({ uri, onChange }: Props) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);

  const pickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access photos",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access camera",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
    } catch {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  return (
    <>
      {uri ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
          <Pressable
            style={styles.removeButton}
            onPress={() => setRemoveModalVisible(true)}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <ImageIcon width={32} height={32} stroke={Colors.textSecondary} />
          <Text style={styles.addText}>Add photo</Text>
        </Pressable>
      )}

      {/* ---------------------------- Add Photo Options --------------------------- */}
      <BaseModal
        visible={addModalVisible}
        title="Add Photo"
        message="Choose an option"
        onDismiss={() => setAddModalVisible(false)}
        buttons={[
          {
            text: "Take Photo",
            variant: "primary",
            onPress: () => {
              setAddModalVisible(false);
              takePhoto();
            },
          },
          {
            text: "Choose from Library",
            variant: "primary",
            onPress: () => {
              setAddModalVisible(false);
              pickFromLibrary();
            },
          },
          { text: "Cancel", onPress: () => setAddModalVisible(false) },
        ]}
      />

      {/* ------------------------ Remove Photo Confirmation ----------------------- */}
      <BaseModal
        visible={removeModalVisible}
        title="Remove Photo"
        message="Are you sure you want to remove this photo?"
        onDismiss={() => setRemoveModalVisible(false)}
        buttons={[
          { text: "Cancel", onPress: () => setRemoveModalVisible(false) },
          {
            text: "Remove",
            variant: "destructive",
            onPress: () => {
              onChange(null);
              setRemoveModalVisible(false);
            },
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.textSecondary + "30",
    borderStyle: "dashed",
    gap: 8,
  },
  addText: { color: Colors.textSecondary, fontSize: 15, fontWeight: "500" },
  photoContainer: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    height: 160,
    backgroundColor: Colors.surface,
  },
  photo: { width: "100%", height: "100%" },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: { color: "#fff", fontSize: 20, fontWeight: "600" },
});
