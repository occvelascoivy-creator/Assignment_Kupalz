import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import axios from "@/api/axios";
import { router } from "expo-router";

export default function Create() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<any>({});

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
      setImage(result.assets[0]);
      if (errors.image) {
        setErrors((prev: any) => ({ ...prev, image: undefined }));
      }
    }
  };

  const handleCreateBlog = async () => {
    // Input validation only
    const newErrors: any = {};
    
    if (!title.trim()) {
      newErrors.title = ["Title is required"];
    } else if (title.length < 3) {
      newErrors.title = ["Title must be at least 3 characters"];
    }
    
    if (!description.trim()) {
      newErrors.description = ["Description is required"];
    } else if (description.length < 10) {
      newErrors.description = ["Description must be at least 10 characters"];
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      await axios.post(
        "/create/blog",
        { title, image: image?.file, description },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      Alert.alert("Success", "Blog created successfully!");
      setTitle("");
      setDescription("");
      setImage(null);
      router.navigate("/home");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to create blog");
    }
  };

  return (
    <View className="p-4 gap-4">
      <Text className="text-2xl font-bold text-gray-800">Create ug Blog</Text>
      
      <View>
        <TextInput
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) {
              setErrors((prev: any) => ({ ...prev, title: undefined }));
            }
          }}
          className={`h-12 px-4 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Title"
        />
        {errors.title && (
          <Text className="text-red-500 text-xs mt-1">{errors.title[0]}</Text>
        )}
      </View>
      
      <View>
        <TextInput
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            if (errors.description) {
              setErrors((prev: any) => ({ ...prev, description: undefined }));
            }
          }}
          className={`h-12 px-4 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Description"
        />
        {errors.description && (
          <Text className="text-red-500 text-xs mt-1">{errors.description[0]}</Text>
        )}
      </View>
      
      <View>
        <TouchableOpacity
          onPress={pickImage}
          className="h-12 bg-blue-500 items-center justify-center rounded-lg"
        >
          <Text className="text-white">Butangi ug imahe</Text>
        </TouchableOpacity>
      </View>
      
      {image && (
        <Image
          className="h-40 rounded-lg"
          source={{
            uri: image.uri,
          }}
        />
      )}
      
      <TouchableOpacity
        onPress={handleCreateBlog}
        className="h-12 rounded-full bg-blue-500 items-center justify-center"
      >
        <Text className="text-white font-bold">Buhat ug Blog</Text>
      </TouchableOpacity>
      
      <Pressable onPress={() => router.navigate("/home")} className="mt-2">
        <Text className="text-blue-500 text-center"> ⬅️ Balik sa Balay</Text>
      </Pressable>
    </View>
  );
}