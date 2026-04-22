import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function pickImageFromLibrary(
  options: ImagePicker.ImagePickerOptions = { allowsEditing: false, quality: 0.8 }
): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Please allow photo library access.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
