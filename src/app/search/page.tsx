"use client";

import { Input } from "@/components/ui/input";
import { TypewriterEffect } from "@/components/ui/type-writter";
import { Search } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Footer from "@/pages/homepage/footer";
import AuthenticatedRoute from "@/helpers/authenticated-route";
import Navbar from "../nabvar";
import { useUpdateCredits } from "@/hooks/use-credits";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useSession } from "@/hooks/use-session";

const FloatingIcon = ({
  icon,
  className,
}: {
  icon: string;
  className: string;
}) => (
  <motion.div
    className={`absolute ${className} opacity-70`}
    animate={{
      y: ["0%", "20%", "0%"],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      repeatType: "reverse",
    }}
  >
    {icon}
  </motion.div>
);

export default function Page() {
  const [input, setInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { updateCreditsAndSearch } = useUpdateCredits();
  const navigate = useRouter();
  const { toast } = useToast();
  const { session } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const checkCredits = async () => {
    try {
      const { data: credits, error } = await db
        .from("credits")
        .select("total_credit, used_credit")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (!credits) {
        toast({
          title: "Error",
          description: "Unable to fetch credits information",
          variant: "destructive",
        });
        return false;
      }

      const remainingCredits =
        credits.total_credit - (credits.used_credit || 0);

      if (remainingCredits <= 0) {
        toast({
          title: "No Credits Remaining",
          description:
            "You've used all your credits. Please purchase more to continue searching.",
          variant: "destructive",
        });
        navigate.push("/dashboard/credits"); // Redirect to credits page
        return false;
      }

      toast({
        title: "Credits Available",
        description: `You have ${remainingCredits} credits remaining`,
        variant: "info",
      });
      return true;
    } catch (error) {
      console.error("Error checking credits:", error);
      toast({
        title: "Error",
        description: "Unable to verify credits. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const startSearch = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(input);
      navigate.push(`/search/${input}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      startSearch();
    }
  };

  return (
    <>
      <AuthenticatedRoute>
        {/* <Header className="bg-[#faf5ff] border-purple-600 border-b-2" /> */}
        <Navbar className="bg-transparent" />
        {/* <BackgroundLines> */}
        <div className="min-h-screen h-screen  flex flex-col items-center -mt-16 pt-16 ">
          <div className="flex flex-col w-full h-full items-center justify-center gap-8 relative">
            {/* Background gradients */}
            <div className="w-64 h-64 bg-gradient-to-br from-orange-200 to-red-300 rounded-full opacity-20 absolute -top-24 -left-16 blur-3xl" />
            {/* <div className="w-64 h-64 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full opacity-20 absolute -bottom-24 right-0 blur-3xl" /> */}

            {/* Floating icons */}
            {/* <FloatingIcon icon="🔍" className="text-4xl top-[30%] left-96" /> */}
            {/* <FloatingIcon icon="📊" className="text-4xl bottom-20 right-20" />
          <FloatingIcon icon="🏢" className="text-4xl top-1/3 right-52" /> */}
            {/* <FloatingIcon icon="🌎" className="text-4xl bottom-[40%] right-96" /> */}

            {/* Main content */}
            {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-purple-800 mb-4">
              Explore opportunities with our advanced search
            </h1>
          </motion.div> */}

            <TypewriterEffect
              title="Search With"
              words={[
                "Noc Code",
                "Program",
                "Employer",
                "Address",
                "Occupation",
                "City",
                "Employer Name",
                "Province Mapping",
                "",
              ]}
            />

            <motion.div
              className="w-[40%] relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Input
                className="w-full rounded-full py-3 font-bold text-2xl h-14 focus-visible:ring-orange-600 pl-4 pr-14 shadow-lg"
                placeholder="Start Your Search ..."
                onChange={handleChange}
                onKeyDown={handleKeyPress}
              />
              <motion.div
                className="absolute top-2 right-2 bg-orange-600 rounded-full p-2 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={startSearch}
              >
                {isChecking ? (
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="text-white" />
                )}
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-16 grid grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                {
                  icon: "🚀",
                  title: "Fast Results",
                  description: "Get instant matches",
                },
                {
                  icon: "🔒",
                  title: "Secure Search",
                  description: "Your data is protected",
                },
                {
                  icon: "🌟",
                  title: "Smart Filters",
                  description: "Refine your search easily",
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-orange-700">
                    {feature.title}
                  </h3>
                  <p className="text-orange-600">{feature.description}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        {/* </BackgroundLines> */}
        <Footer />
      </AuthenticatedRoute>
    </>
  );
}
