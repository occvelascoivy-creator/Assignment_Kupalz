import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string[]; password?: string[]; general?: string }>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors: { email?: string[]; password?: string[]; } = {};

    // Validation rules
    if (!email.trim()) {
      newErrors.email = ["Email is required"];
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = ["Please enter a valid email address"];
    }

    if (!password) {
      newErrors.password = ["Password is required"];
    } else if (password.length < 8) {
      newErrors.password = ["Password must be at least 8 characters"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("");
      return;
    }

    setErrors({});
    setMessage("");
    setIsLoading(true);
    
    try {
      await login({ email, password });
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;
        if (backendErrors) {
          setErrors(backendErrors);
        } else if (error.response.data.message === "The provided credentials are incorrect.") {
          setErrors({ 
            general: "Invalid email or password. Please try again." 
          });
        }
      } else if (error.response?.status === 401) {
        setErrors({ 
          general: "Invalid credentials. Please check your email and password." 
        });
      } else if (error.response?.status === 404) {
        setErrors({ 
          general: "No account found with this email. Please register first." 
        });
      } else if (error.message === "Network Error") {
        setErrors({ 
          general: "Network error. Please check your internet connection." 
        });
      } else {
        setErrors({ 
          general: error.response?.data?.message || "Login failed. Please try again." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-indigo-100">
      <View className="bg-white/90 backdrop-blur-lg shadow-2xl p-8 w-full rounded-3xl border border-white/20" style={{ elevation: 20 }}>
        {message && (
          <View className="mb-4 px-4 py-3 bg-green-500/10 rounded-2xl border border-green-500/20">
            <Text className="text-green-600 text-center font-semibold">
              {message}
            </Text>
          </View>
        )}
        
        {errors.general && (
          <View className="mb-4 px-4 py-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Text className="text-red-600 text-center font-semibold">
              {errors.general}
            </Text>
          </View>
        )}
        
        <View className="items-center mb-6">
          <View >
          </View>
          <Text className="text-2xl font-bold text-gray-800">Welcome Back</Text>
          <Text className="text-gray-500 text-sm mt-1">Sign in to continue</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-semibold mb-2 text-sm">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
                if (errors.general) setErrors({ ...errors, general: undefined });
              }}
              className={`h-14 px-5 bg-gray-50 rounded-2xl border text-gray-800 text-base ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {errors.email && (
              <View className="mt-2 flex-row items-center">
                <Text className="text-red-500 text-xs">⚠️ </Text>
                <Text className="text-red-500 text-xs">{errors.email[0]}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className="text-gray-700 font-semibold mb-2 text-sm">Password</Text>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
                if (errors.general) setErrors({ ...errors, general: undefined });
              }}
              className={`h-14 px-5 bg-gray-50 rounded-2xl border text-gray-800 text-base ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter your password"
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


          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 items-center justify-center shadow-lg active:opacity-90 ${isLoading ? 'opacity-70' : ''}`}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-base ml-2">Signing In...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600 text-sm">Don't have an account? </Text>
            <Pressable onPress={() => router.navigate({ pathname: "/register" })} disabled={isLoading}>
              <Text className="text-blue-600 font-semibold text-sm">
                Sign Up!
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}