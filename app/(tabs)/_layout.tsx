import { Tabs } from "expo-router";
import React from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ListTodo } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopColor: "#222",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },

        tabBarActiveTintColor: "#E85D04",

        tabBarInactiveTintColor: "#666",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <ListTodo size={28} color={color} />,
        }}
      />

      {/* Here on are the routes to hide on the Tab/Nav Bar */}
      <Tabs.Screen
        name="habits"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tasks/today"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tasks/tomorrow"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tasks/history"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
