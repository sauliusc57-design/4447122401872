import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Request media library permission then open the image picker and return the selected URI
export async function pickImageFromLibrary(
  options: ImagePicker.ImagePickerOptions = { allowsEditing: false, quality: 0.8 }
): Promise<string | null> {
  // Ask for permission before accessing the photo library
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Please allow photo library access.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(options);
  // Return null if the user cancelled or no asset was returned
  if (result.canceled || !result.assets || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
