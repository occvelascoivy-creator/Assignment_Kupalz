import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, Alert, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [profile_image, setProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const maxSizeInMB = 5;
      const fileSizeInMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
      
      if (fileSizeInMB > maxSizeInMB) {
        Alert.alert(
          "File Too Large",
          `Please select an image smaller than ${maxSizeInMB}MB. Selected image is ${fileSizeInMB.toFixed(2)}MB.`
        );
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (selectedImage.mimeType && !validTypes.includes(selectedImage.mimeType)) {
        Alert.alert(
          "Invalid File Type",
          "Please select a valid image file (JPEG, PNG, GIF, or WEBP)."
        );
        return;
      }
      
      if (selectedImage.width && selectedImage.height) {
        const minDimension = 100;
        const maxDimension = 4096;
        
        if (selectedImage.width < minDimension || selectedImage.height < minDimension) {
          Alert.alert(
            "Image Too Small",
            `Please select an image at least ${minDimension}x${minDimension} pixels.`
          );
          return;
        }
        
        if (selectedImage.width > maxDimension || selectedImage.height > maxDimension) {
          Alert.alert(
            "Image Too Large",
            `Please select an image no larger than ${maxDimension}x${maxDimension} pixels.`
          );
          return;
        }
      }
      
      setProfileImage(selectedImage);
      if (errors.profile_image) {
        setErrors((prev: any) => ({ ...prev, profile_image: undefined }));
      }
    }
  };

  const handleRegistration = async () => {
    const newErrors: any = {};
    if (!name) newErrors.name = ["Name is required"];
    if (!email) newErrors.email = ["Email is required"];
    if (!password) newErrors.password = ["Password is required"];
    if (password !== password_confirmation) newErrors.password_confirmation = ["Passwords do not match"];
    if (!profile_image) {
      newErrors.profile_image = ["Profile picture is required"];
    } else {
      if (profile_image.fileSize) {
        const maxSizeInMB = 5;
        const fileSizeInMB = profile_image.fileSize / (1024 * 1024);
        if (fileSizeInMB > maxSizeInMB) {
          newErrors.profile_image = [`Image size must be less than ${maxSizeInMB}MB`];
        }
      }
      if (profile_image.mimeType) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(profile_image.mimeType)) {
          newErrors.profile_image = ["Please select a valid image file (JPEG, PNG, GIF, or WEBP)"];
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation,
        profile_image 
      });
  
    } catch (e: any) {
      if (e.response && e.response.status === 422) {
        setErrors(e.response.data.errors);
      } else {
        Alert.alert("Error", "Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    if (errors.profile_image) {
      setErrors((prev: any) => ({ ...prev, profile_image: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1 bg-gradient-to-b from-blue-50 to-indigo-100"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-center p-6 min-h-screen">
          <View className="bg-white/90 backdrop-blur-lg shadow-2xl p-8 w-full rounded-3xl border border-white/20 mb-8" style={{ elevation: 20 }}>
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
              </View>
              <Text className="text-2xl font-bold text-gray-800">Create Account!</Text>
            </View>

            <View className="space-y-4">
              <View className="items-center mb-2">
                <TouchableOpacity
                  onPress={pickImage}
                  disabled={isLoading}
                  className={`w-32 h-32 rounded-2xl justify-center items-center overflow-hidden shadow-lg ${
                    errors.profile_image 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-300' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  } ${isLoading ? 'opacity-50' : ''}`}
                  activeOpacity={0.8}
                >
                  {profile_image ? (
                    <>
                      <Image source={{ uri: profile_image.uri }} className="w-full h-full" />
                      <TouchableOpacity 
                        onPress={removeImage}
                        disabled={isLoading}
                        className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                      >
                        <Text className="text-white text-xs font-bold">✕</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View className="items-center">
                      <Text className="text-xs text-center text-white font-medium">Upload Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {errors.profile_image && (
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-red-500 text-xs">⚠️ </Text>
                    <Text className="text-red-500 text-xs">{errors.profile_image[0]}</Text>
                  </View>
                )}
              </View>

              {/* Name Field */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2 text-sm">Full Name</Text>
                <TextInput 
                  value={name} 
                  onChangeText={setName} 
                  className="h-14 px-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-800 text-base"
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  editable={!isLoading}
                />
                {errors.name && (
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-red-500 text-xs">⚠️ </Text>
                    <Text className="text-red-500 text-xs">{errors.name[0]}</Text>
                  </View>
                )}
              </View>

              {/* Email Field */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2 text-sm">Email Address</Text>
                <TextInput 
                  value={email} 
                  onChangeText={setEmail} 
                  className="h-14 px-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-800 text-base"
                  placeholder="john@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {errors.email && (
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-red-500 text-xs">⚠️ </Text>
                    <Text className="text-red-500 text-xs">{errors.email[0]}</Text>
                  </View>
                )}
              </View>

              {/* Password Field */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2 text-sm">Password</Text>
                <TextInput 
                  value={password} 
                  onChangeText={setPassword} 
                  className="h-14 px-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-800 text-base"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry 
                  editable={!isLoading}
                />
                {errors.password && (
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-red-500 text-xs">⚠️ </Text>
                    <Text className="text-red-500 text-xs">{errors.password[0]}</Text>
                  </View>
                )}
              </View>

              {/* Confirm Password Field */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2 text-sm">Confirm Password</Text>
                <TextInput 
                  value={password_confirmation} 
                  onChangeText={setPasswordConfirmation} 
                  className="h-14 px-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-800 text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry 
                  editable={!isLoading}
                />
                {errors.password_confirmation && (
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-red-500 text-xs">⚠️ </Text>
                    <Text className="text-red-500 text-xs">{errors.password_confirmation[0]}</Text>
                  </View>
                )}
              </View>

              {/* Register Button */}
              <TouchableOpacity 
                onPress={handleRegistration} 
                disabled={isLoading}
                className={`h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 items-center justify-center shadow-lg active:opacity-90 mt-4 ${isLoading ? 'opacity-70' : ''}`}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-base ml-2">Creating Account...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base">Sign Up!</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mt-2 pb-4">
                <Text className="text-gray-600 text-sm">Already have an account? </Text>
                <Pressable onPress={() => router.navigate("/login")} disabled={isLoading}>
                  <Text className="text-blue-600 font-semibold text-sm">
                    Sign In!
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}