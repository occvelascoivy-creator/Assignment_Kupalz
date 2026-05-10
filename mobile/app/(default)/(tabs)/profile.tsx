import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const { 
    logout, 
    user, 
    isLoading, 
    updateProfileInfo, 
    updateProfileImage, 
    removeProfileImage,
    updatePassword 
  } = useAuth();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editProfileImage, setEditProfileImage] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
  }>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const openEditModal = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setEditProfileImage(null);
    setIsEditModalVisible(true);
  };

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
    setIsPasswordModalVisible(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Needed", "Sorry, we need camera roll permissions to change profile picture!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditProfileImage(result.assets[0]);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert("Error", "Name and email cannot be empty");
      return;
    }

    if (!editEmail.includes('@') || !editEmail.includes('.')) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfileInfo({
        name: editName,
        email: editEmail,
      });
      
      if (editProfileImage && editProfileImage !== "remove") {
        await updateProfileImage(editProfileImage);
      }
      
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditModalVisible(false);
      setEditProfileImage(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await removeProfileImage();
      Alert.alert("Success", "Profile photo removed successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangePassword = async () => {
    // Clear previous errors
    setPasswordErrors({});
    
    // Validation
    const errors: any = {};
    
    if (!currentPassword) {
      errors.current_password = "Current password is required";
    }
    
    if (!newPassword) {
      errors.new_password = "New password is required";
    } else if (newPassword.length < 8) {
      errors.new_password = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      errors.confirm_password = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      errors.confirm_password = "Passwords do not match";
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      
      // Close modal and clear form
      setIsPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      
    } catch (error: any) {
      console.error("Password change error:", error);
      // Error is already shown in context, but we can add specific handling
      if (error.response?.data?.message === "Current password is incorrect.") {
        setPasswordErrors({ current_password: "Current password is incorrect" });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-indigo-100">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-indigo-100">
      <View className="flex-1 items-center justify-center px-6 py-12">
        <View className="bg-white/90 backdrop-blur-lg shadow-2xl w-full rounded-3xl border border-white/20 overflow-hidden" style={{ elevation: 20 }}>
          
          <View className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 pt-8 pb-16 items-center">
            <Text className="text-white text-2xl font-bold">My Profile</Text>
          </View>
          
          <View className="items-center -mt-12 mb-4">
            <View className="relative">
              {user?.profile_image ? (
                <Image
                  className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg"
                  source={{ uri: `http://127.0.0.1:8000/storage/${user?.profile_image}` }}
                  style={{ backgroundColor: '#E5E7EB' }}
                />
              ) : (
                <View className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 items-center justify-center border-4 border-white shadow-lg">
                  <Text className="text-white text-3xl font-bold">
                    {user?.name ? getInitials(user.name) : "U"}
                  </Text>
                </View>
              )}

              <View className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            </View>
          </View>

          <View className="px-6 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
                Account Information
              </Text>

            </View>
            
            <View className="bg-gray-100 rounded-2xl p-4 mb-4 flex-row items-center border border-gray-100">
              <View>
                <Text></Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Email Address</Text>
                <Text className="text-gray-800 text-base font-medium mt-1">
                  {user?.email || "user@example.com"}
                </Text>
              </View>
            </View>
            
            <View className="bg-gray-100 rounded-2xl p-4 mb-4 flex-row items-center border border-gray-100">
              <View>
                <Text></Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Full Name</Text>
                <Text className="text-gray-800 text-base font-medium mt-1">
                  {user?.name || "User Name"}
                </Text>
              </View>
            </View>
        
          </View>

          {/* Edit Button section moved to top */}
          <View className="px-6 pb-4">
            <TouchableOpacity
              onPress={openEditModal}
              className="h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 items-center justify-center shadow-lg active:opacity-90 mb-3"
              activeOpacity={0.9}
            >
              <Text className="text-white font-bold text-base"> Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={logout}
              className="h-12 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 items-center justify-center shadow-lg active:opacity-90"
              activeOpacity={0.9}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-base"> Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl w-11/12 max-w-md p-6 shadow-xl">
            <View className="items-center mb-6">
              <View>
              </View>
              <Text className="text-2xl font-bold text-gray-800">Edit Profile</Text>
            </View>

            {/* Profile Image Section in Modal */}
            <View className="items-center mb-6">   
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                {editProfileImage ? (
                  <View className="relative">
                    <Image
                      source={{ uri: editProfileImage.uri }}
                      className="w-24 h-24 rounded-full border-2 border-blue-500"
                    />
                    <View className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                      <Text className="text-white text-xs">✎</Text>
                    </View>
                  </View>
                ) : user?.profile_image ? (
                  <View className="relative">
                    <Image
                      source={{ uri: `http://127.0.0.1:8000/storage/${user?.profile_image}` }}
                      className="w-24 h-24 rounded-full border-2 border-gray-300"
                    />
                    <View className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                      <Text className="text-white text-xs">✎</Text>
                    </View>
                  </View>
                ) : (
                  <View className="relative">
                    <View className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 items-center justify-center border-2 border-gray-300">
                      <Text className="text-white text-3xl font-bold">
                        {user?.name ? getInitials(user.name) : "U"}
                      </Text>
                    </View>
                    <View className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                      <Text className="text-white text-xs">✎</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 mt-2">Tap to change profile picture</Text>
              
              {(user?.profile_image || editProfileImage) && (
                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert(
                      "Remove Photo",
                      "Do you want to remove your profile picture?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Remove", 
                          style: "destructive",
                          onPress: async () => {
                            if (editProfileImage) {
                              setEditProfileImage(null);
                            } else if (user?.profile_image) {
                              await handleRemoveImage();
                              setIsEditModalVisible(false);
                            }
                          }
                        }
                      ]
                    );
                  }}
                  className="mt-2"
                >
                </TouchableOpacity>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Full Name</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                placeholder="Enter your name"
                value={editName}
                onChangeText={setEditName}
                editable={!isUpdating}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                placeholder="Enter your email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isUpdating}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-gray-200"
                onPress={() => {
                  setIsEditModalVisible(false);
                  setEditProfileImage(null);
                }}
                disabled={isUpdating}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-blue-500"
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                <Text className="text-white font-semibold text-center">
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}