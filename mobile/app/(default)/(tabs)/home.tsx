import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";

import { useAuth } from "@/contexts/auth-context";
import React, { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import axios from "@/api/axios";

type BlogProps = {
  id: number;
  title: string;
  image: string;
  description: string;
  user_id?: number;
};

export default function Home() {
  const [blogs, setBlogs] = useState<BlogProps[]>([]);
  const [myBlogs, setMyBlogs] = useState<BlogProps[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  const { user } = useAuth();

  const getBlogs = async () => {
    try {
      const response = await axios.get("/fetchBlogs");

      setBlogs(response.data);

      if (user?.id) {
        const userBlogs = response.data.filter(
          (blog: BlogProps) =>
            Number(blog.user_id) === Number(user.id)
        );

        setMyBlogs(userBlogs);
      }
    } catch (error) {
      console.log("Error fetching blogs:", error);
      Alert.alert("Error", "Failed to fetch blogs");
    }
  };

  const handleDeleteBlog = async () => {
    if (!selectedBlogId) return;

    try {
      setIsDeleting(selectedBlogId);

      console.log("Attempting delete:", selectedBlogId);

      const response = await axios.delete(
        `/blogs/${selectedBlogId}`
      );

      console.log("DELETE SUCCESS:", response.data);

      setBlogs((prev) =>
        prev.filter((blog) => blog.id !== selectedBlogId)
      );

      setMyBlogs((prev) =>
        prev.filter((blog) => blog.id !== selectedBlogId)
      );

      setDeleteModalVisible(false);
      setSelectedBlogId(null);

      Alert.alert("Success", "Blog deleted successfully");
    } catch (error: any) {
      console.log("DELETE ERROR:", error);
      console.log("DELETE RESPONSE:", error.response?.data);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete blog"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getBlogs();
    }, [user])
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-6 pt-12">
        <Text className="text-3xl font-bold text-gray-800">
          Fresh Blogs
        </Text>

        <Text className="text-gray-500 text-sm mt-1">
          Scroll to enjoy the latest posts
        </Text>
      </View>

      {/* Create Blog Button */}
      <View className="px-6 mb-4">
        <Pressable
          onPress={() =>
            router.navigate("/(default)/(pages)/home/create")
          }
        >
          <View className="bg-blue-500 rounded-2xl p-4 shadow-lg">
            <Text className="text-white text-lg font-bold text-center">
              + Create Blog Post
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-4">
        <Pressable
          onPress={() => setActiveTab("all")}
          className="flex-1 mr-2"
        >
          <View
            className={`py-3 rounded-xl ${
              activeTab === "all"
                ? "bg-blue-500"
                : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "all"
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              All Blogs ({blogs.length})
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("my")}
          className="flex-1 ml-2"
        >
          <View
            className={`py-3 rounded-xl ${
              activeTab === "my"
                ? "bg-blue-500"
                : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "my"
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              My Blogs ({myBlogs.length})
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6 pt-0">
          {activeTab === "all" ? (
            <View className="gap-6">
              {blogs.length === 0 ? (
                <View className="bg-white rounded-2xl p-8 items-center">
                  <Text className="text-gray-500 text-lg">
                    No blogs yet
                  </Text>

                  <Text className="text-gray-400 text-sm mt-2">
                    Be the first to create a blog!
                  </Text>
                </View>
              ) : (
                blogs.map((blog) => (
                  <Pressable
                    key={blog.id}
                    onPress={() =>
                      router.navigate(`/blogs/${blog.id}`)
                    }
                    className="mb-2"
                  >
                    <View className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      <Image
                        className="h-56 w-full"
                        source={{
                          uri: `http://127.0.0.1:8000/storage/${blog.image}`,
                        }}
                        style={{ resizeMode: "cover" }}
                      />

                      <View className="p-4">
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                          {blog.title}
                        </Text>

                        <Text className="text-gray-600 text-base leading-6">
                          {blog.description.length > 120
                            ? `${blog.description.substring(
                                0,
                                120
                              )}...`
                            : blog.description}
                        </Text>

                        {Number(blog.user_id) ===
                          Number(user?.id) && (
                          <View className="mt-2">
                            <Text className="text-blue-600 text-xs font-semibold">
                              Your Blog
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          ) : (
            <View className="gap-6">
              {myBlogs.length === 0 ? (
                <View className="bg-white rounded-2xl p-8 items-center">
                  <Text className="text-gray-500 text-lg">
                    You don't have any blogs yet
                  </Text>

                  <Text className="text-gray-400 text-sm mt-2">
                    Create your first blog now ^_^
                  </Text>
                </View>
              ) : (
                myBlogs.map((blog) => (
                  <View
                    key={blog.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-4"
                  >
                    <Pressable
                      onPress={() =>
                        router.navigate(`/blogs/${blog.id}`)
                      }
                      style={{ flex: 1 }}
                    >
                      <Image
                        className="h-56 w-full"
                        source={{
                          uri: `http://127.0.0.1:8000/storage/${blog.image}`,
                        }}
                        style={{ resizeMode: "cover" }}
                      />

                      <View className="p-4">
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                          {blog.title}
                        </Text>

                        <Text className="text-gray-600 text-base leading-6">
                          {blog.description.length > 120
                            ? `${blog.description.substring(
                                0,
                                120
                              )}...`
                            : blog.description}
                        </Text>
                      </View>
                    </Pressable>

                    {/* Delete Button */}
                    <View className="px-4 pb-4 flex-row justify-end">
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedBlogId(blog.id);
                          setDeleteModalVisible(true);
                        }}
                        activeOpacity={0.7}
                        disabled={isDeleting === blog.id}
                        style={{
                          backgroundColor: "#ef4444",
                          borderRadius: 999,
                          paddingHorizontal: 24,
                          paddingVertical: 10,
                          opacity:
                            isDeleting === blog.id ? 0.6 : 1,
                        }}
                      >
                        {isDeleting === blog.id ? (
                          <ActivityIndicator
                            color="white"
                            size="small"
                          />
                        ) : (
                          <Text className="text-white text-sm font-semibold">
                            Delete Blog
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 12,
              }}
            >
              Delete Blog
            </Text>

            <Text
              style={{
                color: "#666",
                marginBottom: 24,
                lineHeight: 22,
              }}
            >
              Are you sure you want to delete this blog?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedBlogId(null);
                }}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "#e5e7eb",
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteBlog}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "#ef4444",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}