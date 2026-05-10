import { useAuth } from "@/contexts/auth-context";
import "@/global.css";

import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const { getUser } = useAuth();

  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
