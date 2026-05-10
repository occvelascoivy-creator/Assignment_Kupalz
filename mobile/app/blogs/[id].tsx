import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import axios from "@/api/axios";
import { Pressable } from "react-native";

type BlogDetailProps = {
  id: number;
  title: string;
  image: string;
  description: string;
  content?: string; 
  created_at?: string;
};

export default function BlogDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogDetailProps | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.log("Error fetching blog details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-indigo-100">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!blog) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-indigo-100">
        <Text className="text-gray-600 text-lg">Blog post not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-600 text-base">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gradient-to-b from-blue-50 to-indigo-100"
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <Pressable 
        onPress={() => router.back()} 
        className="absolute top-12 left-4 z-10 bg-white/90 rounded-full p-2 shadow-md"
      >
        <Text className="text-blue-600 text-lg font-bold">← Back</Text>
      </Pressable>

      {/* Blog Image */}
      <Image
        className="h-72 w-full"
        source={{
          uri: `http://127.0.0.1:8000/storage/${blog.image}`,
        }}
        style={{ resizeMode: 'cover' }}
      />

      {/* Blog Content */}
      <View className="p-6">
        {/* Title */}
        <Text className="text-3xl font-bold text-gray-800 mb-4">
          {blog.title}
        </Text>

        {/* Meta Info (Optional) */}
        {blog.created_at && (
          <Text className="text-gray-500 text-sm mb-6">
            Posted on {new Date(blog.created_at).toLocaleDateString()}
          </Text>
        )}

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-700 text-lg leading-7">
            {blog.description}
          </Text>
        </View>

        {/* Full Content (if available) */}
        {blog.content && (
          <View className="border-t border-gray-200 pt-6">
            <Text className="text-xl font-bold text-gray-800 mb-3">
              Full Story
            </Text>
            <Text className="text-gray-700 text-base leading-6">
              {blog.content}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}