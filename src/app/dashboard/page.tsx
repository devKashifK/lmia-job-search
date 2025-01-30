"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import UserProfile from "./profile/page";
import Settings from "./settings/page";
import Credits from "./credits/page";
import db from "@/db";
import LoadingScreen from "@/components/ui/loading-screen";
import { User } from "@supabase/supabase-js";
import RecentSearches from "./recent-searches/page";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const {
      data: { user },
    } = await db.auth.getUser();
    setUserData(user);
  }

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {activeTab === "profile" && (
        <Suspense fallback={<LoadingScreen />}>
          <UserProfile />{" "}
        </Suspense>
      )}
      {activeTab === "settings" && (
        <Suspense fallback={<LoadingScreen />}>
          <Settings />
        </Suspense>
      )}
      {activeTab === "credits" && (
        <Suspense fallback={<LoadingScreen />}>
          <Credits />
        </Suspense>
      )}
      {activeTab === "recent-searches" && (
        <Suspense fallback={<LoadingScreen />}>
          <RecentSearches />
        </Suspense>
      )}
    </motion.div>
  );
}
