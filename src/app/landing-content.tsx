"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Users, Search, Shield, Network } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Connect with Alumni",
    description: "Find and connect with fellow graduates from your institution.",
  },
  {
    icon: Search,
    title: "Search & Discover",
    description: "Search by name, department, company, or graduation year.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All profiles are verified by administrators for authenticity.",
  },
  {
    icon: Network,
    title: "Build Your Network",
    description: "Expand your professional network and stay connected.",
  },
];

export default function LandingContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <Navbar />
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 to-green-400/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-green-400/20 to-blue-400/20 blur-3xl" />
        {/* Hero Section */}
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20">
          <motion.main
            className="w-full max-w-6xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold mb-3 bg-gradient-to-r from-blue-700 via-green-600 to-blue-800 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Zexa Tech School, Ajmer Rajasthan
            </motion.h1>
            <motion.p
              className="text-2xl md:text-3xl font-semibold text-zinc-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              Alumni Directory
            </motion.p>
            <motion.p
              className="text-xl md:text-2xl text-zinc-700 mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Connect with your fellow alumni. Search, discover, and stay connected with your alma mater community.
            </motion.p>
            <motion.div
              className="flex gap-4 justify-center flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white px-8 py-6 text-lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
                <Link href="/alumni">Browse Alumni</Link>
              </Button>
            </motion.div>
          </motion.main>
        </div>

        {/* Features Section */}
        <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Why Join Our Directory?
              </h2>
              <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                Discover the benefits of being part of our alumni network
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-green-100 dark:border-zinc-800"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-zinc-900">{feature.title}</h3>
                    <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Connect?
              </h2>
              <p className="text-xl text-blue-50 mb-8">
                Join thousands of alumni already connected in our directory
              </p>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold">
                <Link href="/register">Create Your Profile</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
