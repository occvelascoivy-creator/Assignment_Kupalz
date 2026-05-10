import axios from "@/api/axios";
import { getToken, setToken } from "@/services/auth-storage";
import { router } from "expo-router";
import { Alert } from "react-native";
import { create } from "zustand";
import { ImagePickerAsset } from 'expo-image-picker';
import { isAxiosError } from "axios";


interface User {
  id?: number;
  name: string;
  email: string;
  profile_image: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  profile_image: ImagePickerAsset | string | null;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  profile_image?: ImagePickerAsset | string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  getUser: () => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileInfo: (data: { name?: string; email?: string }) => Promise<void>;
  updateProfileImage: (image: ImagePickerAsset) => Promise<void>;
  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  removeProfileImage: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  getUser: async () => {
  try {
    const token = await getToken();
    if (!token) return;
    
    const { data } = await axios.get("/user");
    set({ user: data });
  } catch (error) {
    console.log("Get user error:", error);
    if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError === true && error.response?.status === 401) {
      await get().logout();
    }
  }
},

  login: async (data) => {
    set({ isLoading: true });
    try {
      const response = await axios.post("/login", data);
      await setToken(response.data.token);
      await get().getUser();
      Alert.alert("Success", response.data.message || "Login successful!");
      router.replace("/home");
    } catch (error: any) {
      console.log("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Error", errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.password_confirmation);

      if (data.profile_image && typeof data.profile_image !== 'string') {
        // Get file extension from URI
        const uriParts = data.profile_image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const response = await fetch(data.profile_image.uri);
        const blob = await response.blob();
        
        formData.append('profile_image', blob, `profile.${fileType}`);
      }

      const response = await axios.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Alert.alert("Success", response.data.message);
      router.navigate("/login");
    } catch (error: any) {
      console.log("Register error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      Alert.alert("Error", errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update profile information (name/email only)
  updateProfileInfo: async (data: { name?: string; email?: string }) => {
    set({ isLoading: true });
    try {
      const response = await axios.put("/user/profile", data);
      
      if (response.data.user) {
        set({ user: response.data.user });
      } else {
        await get().getUser();
      }
      
      Alert.alert("Success", "Profile information updated successfully!");
    } catch (error: any) {
      console.log("Update profile info error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile information.";
      Alert.alert("Error", errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update profile image only
  updateProfileImage: async (image: ImagePickerAsset) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      const response = await fetch(image.uri);
      const blob = await response.blob();
      formData.append('profile_image', blob, `profile.${fileType}`);
      
      const result = await axios.post("/user/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (result.data.user) {
        set({ user: result.data.user });
      } else {
        await get().getUser();
      }
      
      Alert.alert("Success", "Profile image updated successfully!");
    } catch (error: any) {
      console.log("Update profile image error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile image.";
      Alert.alert("Error", errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove profile image
  removeProfileImage: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.delete("/user/profile-image");
      
      if (response.data.user) {
        set({ user: response.data.user });
      } else {
        await get().getUser();
      }
      
      Alert.alert("Success", "Profile photo removed successfully!");
    } catch (error: any) {
      console.log("Remove profile image error:", error);
      const errorMessage = error.response?.data?.message || "Failed to remove profile image. Please try again.";
      Alert.alert("Error", errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (data: { current_password: string; password: string; password_confirmation: string }) => {
    set({ isLoading: true });
    try {
      const response = await axios.put("/user/password", data);
      Alert.alert("Success", response.data.message || "Password updated successfully!");
    } catch (error: any) {
      console.log("Update password error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update password. Please try again.";
      Alert.alert("Error", errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      await axios.delete("/user/account");
      await setToken(null);
      set({ user: null });
      Alert.alert("Success", "Account deleted successfully!");
      router.replace("/login");
    } catch (error: any) {
      console.log("Delete account error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete account. Please try again.";
      Alert.alert("Error", errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post("/logout");
      await setToken(null);
      set({ user: null });
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
      // Even if API call fails, clear local data
      await setToken(null);
      set({ user: null });
      router.replace("/login");
    } finally {
      set({ isLoading: false });
    }
  },
}));