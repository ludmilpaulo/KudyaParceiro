import { Platform } from "react-native";

/** React Native FormData file payload (uri/name/type). */
export type RNFormDataFile = {
  uri: string;
  name: string;
  type: string;
};

/** Native RN FormData accepts { uri, name, type }; web needs a real Blob/File. */
export async function appendFormDataFile(
  formData: FormData,
  field: string,
  file: RNFormDataFile,
): Promise<void> {
  if (!file?.uri) return;

  if (Platform.OS === "web") {
    // Already a remote URL — skip re-upload.
    if (file.uri.startsWith("http://") || file.uri.startsWith("https://")) {
      return;
    }
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const type = file.type || blob.type || "image/jpeg";
    formData.append(field, new File([blob], file.name || "upload.jpg", { type }));
    return;
  }

  formData.append(field, file as unknown as Blob);
}
