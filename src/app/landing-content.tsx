"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Users, Search, Shield, Network, Calendar, Briefcase, Image as ImageIcon, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Image component with fallback
function ScrollingImage({ src, alt, fallbackSrc }: { src: string; alt: string; fallbackSrc: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="relative h-full w-full">
        <img
          src={fallbackSrc}
          alt={alt}
          className="w-full h-full object-cover rounded-lg"
          onError={() => {
            // If fallback also fails, show placeholder
            setHasError(true);
          }}
        />
      </div>
    );
  }
  
  return (
    <div className="relative h-full w-full">
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          } else {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}

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

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  venue: string | null;
  image_url: string | null;
}

interface Alumni {
  id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  headline: string | null;
  current_company: string | null;
  current_title: string | null;
  grad_year: number | null;
  department: string | null;
}

function CountdownTimer({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const event = new Date(eventDate).getTime();
      const difference = event - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-white/90 dark:bg-zinc-800 rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[70px] shadow-md">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{unit.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingContent() {
  const [stats, setStats] = useState({ alumni: 0, events: 0, companies: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [featuredAlumni, setFeaturedAlumni] = useState<Alumni[]>([]);

  useEffect(() => {
    const supabase = createClient();
    
    // Fetch stats
    Promise.all([
      supabase.from("alumni_details").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("alumni_details").select("current_company").not("current_company", "is", null),
    ]).then(([alumniRes, eventsRes, companiesRes]) => {
      const uniqueCompanies = new Set((companiesRes.data || []).map((a: { current_company: string | null }) => a.current_company).filter(Boolean));
      setStats({
        alumni: alumniRes.count || 0,
        events: eventsRes.count || 0,
        companies: uniqueCompanies.size,
      });
    });

    // Fetch upcoming events
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        setUpcomingEvents(data || []);
      });

    // Fetch featured alumni
    supabase
      .from("alumni_details")
      .select("id, headline, current_company, current_title, grad_year, department, profiles(full_name, avatar_url)")
      .limit(6)
      .order("grad_year", { ascending: false })
      .then(async ({ data }) => {
        if (data) {
          // Process avatar URLs
          const processed = await Promise.all(
            data.map(async (alumni: {
              id: string;
              headline: string | null;
              current_company: string | null;
              current_title: string | null;
              grad_year: number | null;
              department: string | null;
              profiles: { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[];
            }) => {
              // Supabase returns profiles as array when using select with relation
              const profile = Array.isArray(alumni.profiles) ? alumni.profiles[0] : alumni.profiles;
              if (profile?.avatar_url && !profile.avatar_url.startsWith("http")) {
                const { data: urlData } = supabase.storage
                  .from("avatars")
                  .getPublicUrl(profile.avatar_url);
                if (urlData?.publicUrl) {
                  profile.avatar_url = urlData.publicUrl;
                }
              }
              return {
                ...alumni,
                profiles: profile || { full_name: null, avatar_url: null },
              } as Alumni;
            })
          );
          setFeaturedAlumni(processed);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <Navbar />
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 to-green-400/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-green-400/20 to-blue-400/20 blur-3xl" />
        
        {/* Hero Section - Part 1: Scrolling Images Left to Right */}
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[calc(50vh-2rem)] relative overflow-hidden">
          <div className="absolute inset-0 flex animate-scroll-left">
            {[
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
              "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1920&q=80",
              "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80",
              "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1920&q=80",
            ].map((url, idx) => (
              <div key={idx} className="relative h-full w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] shrink-0 mx-1 sm:mx-2">
                <ScrollingImage
                  src={url}
                  alt={`Alumni event ${idx + 1}`}
                  fallbackSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
              "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1920&q=80",
              "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80",
              "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1920&q=80",
            ].map((url, idx) => (
              <div key={`dup-${idx}`} className="relative h-full w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] shrink-0 mx-1 sm:mx-2">
                <ScrollingImage
                  src={url}
                  alt={`Alumni event ${idx + 1}`}
                  fallbackSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Section - Part 2: Content with Scrolling Images Right to Left */}
        <div className="min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:h-[calc(50vh-2rem)] relative flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20">
          {/* Scrolling Images Background - Right to Left */}
          <div className="absolute inset-0 flex animate-scroll-right opacity-20">
            {[
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80",
              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
              "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80",
              "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1920&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
            ].map((url, idx) => (
              <div key={idx} className="relative h-full w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] shrink-0 mx-1 sm:mx-2">
                <ScrollingImage
                  src={url}
                  alt={`Alumni gathering ${idx + 1}`}
                  fallbackSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80",
              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
              "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80",
              "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1920&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
            ].map((url, idx) => (
              <div key={`dup2-${idx}`} className="relative h-full w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] shrink-0 mx-1 sm:mx-2">
                <ScrollingImage
                  src={url}
                  alt={`Alumni gathering ${idx + 1}`}
                  fallbackSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
                />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <motion.main
            className="w-full max-w-6xl text-center relative z-10 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 text-blue-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              The Heritage School Kolkata
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-blue-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              Alumni Directory
            </motion.p>
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-800 dark:text-zinc-200 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Connect with your fellow alumni. Search, discover, and stay connected with your alma mater community.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center flex-wrap px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 text-white w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-blue-900 text-blue-900 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-700 dark:hover:bg-blue-900/20 w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                <Link href="/alumni">Browse Alumni</Link>
              </Button>
            </motion.div>
          </motion.main>
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                { icon: Users, label: "Alumni Members", value: stats.alumni, color: "blue" },
                { icon: Calendar, label: "Events", value: stats.events, color: "green" },
                { icon: Briefcase, label: "Companies", value: stats.companies, color: "purple" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900 mb-3 sm:mb-4`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{stat.value}+</div>
                    <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm py-10 sm:py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent px-2">
                Why Join Our Directory?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-2">
                Discover the benefits of being part of our alumni network
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-green-100 dark:border-zinc-800"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-green-500 py-10 sm:py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">Upcoming Events</h2>
                <p className="text-base sm:text-lg md:text-xl text-blue-50 px-2">Don&apos;t miss out on our exciting alumni gatherings</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="bg-white/95 dark:bg-zinc-900/95">
                      <CardContent className="p-6">
                        <Badge className="mb-3 bg-green-500">Upcoming</Badge>
                        <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{event.title}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                          {format(new Date(event.event_date), "PPP 'at' p")}
                        </p>
                        {(event.location || event.venue) && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            📍 {event.venue || event.location}
                          </p>
                        )}
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login">View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {upcomingEvents[0] && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-white mb-4 font-semibold">Time until next event:</p>
                  <CountdownTimer eventDate={upcomingEvents[0].event_date} />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Featured Alumni Section */}
        {featuredAlumni.length > 0 && (
          <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm py-10 sm:py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent px-2">
                  Featured Alumni
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 px-2">Meet some of our accomplished graduates</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredAlumni.map((alumni, index) => (
                  <motion.div
                    key={alumni.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          {alumni.profiles?.avatar_url ? (
                            <Image
                              src={alumni.profiles.avatar_url}
                              alt={alumni.profiles.full_name || "Alumni"}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xl font-bold">
                              {(alumni.profiles?.full_name || "A")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {alumni.profiles?.full_name || "Alumni Member"}
                            </h3>
                            {alumni.current_title && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">{alumni.current_title}</p>
                            )}
                          </div>
                        </div>
                        {alumni.current_company && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            <Briefcase className="w-4 h-4 inline mr-1" />
                            {alumni.current_company}
                          </p>
                        )}
                        {alumni.grad_year && (
                          <Badge variant="secondary" className="text-xs">
                            Class of {alumni.grad_year}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Button asChild size="lg" variant="outline">
                  <Link href="/alumni">View All Alumni</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Quick Links Section */}
        <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm py-10 sm:py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent px-2">
                Explore More
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Calendar, title: "Events", description: "Join upcoming alumni events", href: "/login", color: "green" },
                { icon: Briefcase, title: "Jobs", description: "Find career opportunities", href: "/login", color: "blue" },
                { icon: ImageIcon, title: "Gallery", description: "View photos and memories", href: "/login", color: "purple" },
                { icon: Newspaper, title: "News", description: "Stay updated with news", href: "/login", color: "orange" },
              ].map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <CardContent className="p-5 sm:p-6 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-${link.color}-100 dark:bg-${link.color}-900 mb-3 sm:mb-4`}>
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-${link.color}-600 dark:text-${link.color}-400`} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{link.title}</h3>
                        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-3 sm:mb-4">{link.description}</p>
                        <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Link href={link.href}>Explore</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 py-10 sm:py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
                Ready to Connect?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-50 mb-6 sm:mb-8 px-2">
                Join thousands of alumni already connected in our directory
              </p>
              <Button asChild size="lg" className="bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold">
                <Link href="/register">Create Your Profile</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 dark:bg-zinc-900 text-white py-8 sm:py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* About Us Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-green-400">About Us</h3>
              <p className="text-sm sm:text-base text-blue-100 dark:text-zinc-300 leading-relaxed mb-3 sm:mb-4">
                The Heritage School Kolkata is committed to fostering lifelong connections among our alumni community. Our alumni directory serves as a platform for graduates to reconnect, network, and stay engaged with their alma mater.
              </p>
              <p className="text-sm sm:text-base text-blue-100 dark:text-zinc-300 leading-relaxed">
                We believe in the power of community and the lasting bonds formed during your time at our institution. Join us in building a stronger, more connected alumni network.
              </p>
            </motion.div>

            {/* Contact Us Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-green-400">Contact Us</h3>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-blue-100 dark:text-zinc-300">
                <div>
                  <p className="font-semibold text-white mb-1">Address</p>
                  <p>The Heritage School</p>
                  <p>Kolkata, India</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Email</p>
                  <a href="mailto:info@theheritageschoolkolkata.edu" className="hover:text-green-400 transition-colors">
                    info@theheritageschoolkolkata.edu
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Phone</p>
                  <a href="tel:+911234567890" className="hover:text-green-400 transition-colors">
                    +91 123 456 7890
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Follow Us</p>
                  <div className="flex gap-4 mt-2">
                    <a href="#" className="hover:text-green-400 transition-colors" aria-label="Facebook">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-green-400 transition-colors" aria-label="Twitter">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-green-400 transition-colors" aria-label="LinkedIn">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-blue-800 dark:border-zinc-700 text-center">
            <p className="text-blue-200 dark:text-zinc-400 text-xs sm:text-sm px-2">
              © {new Date().getFullYear()} The Heritage School Kolkata. All rights reserved.
            </p>
            <p className="text-blue-200/60 dark:text-zinc-400/60 text-xs px-2 mt-1">
              Developed and marketing by Shreyash Patni
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
