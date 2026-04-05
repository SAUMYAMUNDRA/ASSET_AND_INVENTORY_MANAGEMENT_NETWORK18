"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu } from "@headlessui/react";

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/auth/verify`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );
        if (res.status === 200) setIsAdmin(true);
      } catch (err) {
        console.error("Admin check failed:", err);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch user data.");
        const userData = await res.json();

        setUser({
          name: userData.user.name,
          email: userData.user.email,
          city: userData.user.city_name,
          studio_display: userData.user.studio_display,
          asset_inventory: userData.user.asset_inventory,
          event_report: userData.user.event_report,
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Error fetching user data. Redirecting to login...");
        router.replace("/login");
      } finally {
        setUserLoading(false);
      }
    };

    checkAdmin();
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    window.location.href = "/logout";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
          <div className="text-white text-xl font-light">Loading your workspace...</div>
          <div className="h-1 w-48 bg-gray-700 rounded mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">User not found.</div>
      </div>
    );
  }

  // Define all buttons with enhanced styling
  const actionButtons = [
    user.event_report && { 
      icon: "📄", 
      label: "Create Event Report", 
      href: "/create-event-report",
      gradient: "from-emerald-400 to-teal-600",
      hoverGradient: "from-emerald-500 to-teal-700"
    },
    user.studio_display && { 
      icon: "🎬", 
      label: "Studio Displays", 
      href: "/studio-displays",
      gradient: "from-purple-400 to-pink-600",
      hoverGradient: "from-purple-500 to-pink-700"
    },
    user.asset_inventory && { 
      icon: "📦", 
      label: "Event Asset Inventory", 
      href: "/event-asset-inventory",
      gradient: "from-amber-400 to-orange-600",
      hoverGradient: "from-amber-500 to-orange-700"
    },
    { 
      icon: "📊", 
      label: "Event Tracker", 
      href: "/event-tracker",
      gradient: "from-blue-400 to-indigo-600",
      hoverGradient: "from-blue-500 to-indigo-700"
    },
    
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <header className="relative z-10 w-full backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="/NW18.png" alt="Network18 Logo" className="h-12 sm:h-14 drop-shadow-xl" />
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg blur opacity-50"></div>
            </div>
            <div>
              <h1 className="font-bold text-3xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Employee Panel
              </h1>
              <div className="flex items-center gap-2 text-blue-200">
                <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">📍 {user.city}</span>
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="hidden lg:block text-right mr-6">
            <div className="text-white/90 font-mono text-2xl font-bold tracking-wider">
              {formatTime(currentTime)}
            </div>
            <div className="text-blue-200 text-sm">
              {formatDate(currentTime)}
            </div>
          </div>

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 backdrop-blur-sm border border-white/20">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block">{user.name}</span>
              <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl text-gray-800 shadow-2xl rounded-2xl overflow-hidden z-50 border border-white/20">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              {isAdmin && (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/admin"
                      className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                    >
                      <span className="text-lg">🔑</span>
                      Admin Panel
                    </Link>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/reset"
                    className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                  >
                    <span className="text-lg">🔒</span>
                    Reset Password
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors ${active ? "bg-red-50 text-red-700" : "text-gray-700"}`}
                  >
                    <span className="text-lg">🚪</span>
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-12">
            <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-6 leading-tight">
              Welcome back,
            </h2>
            <h3 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-8">
              {user.name}!
            </h3>
            <p className="text-xl text-blue-100/80 font-light leading-relaxed max-w-2xl mx-auto">
              Your workspace awaits. Access all your tools and reports with a single click. 
              <br className="hidden sm:block" />
              Everything you need, beautifully organized.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mb-16 flex justify-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{actionButtons.length}</div>
                  <div className="text-sm text-blue-200">Available Tools</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">●</div>
                  <div className="text-sm text-blue-200">Online</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <div className="text-2xl font-bold text-white">{user.city}</div>
                  <div className="text-sm text-blue-200">Location</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
            {actionButtons.map((btn, idx) => (
              <Link
                key={idx}
                href={btn.href}
                className="group relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${btn.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`}></div>
                <div className="relative flex flex-col justify-center items-center gap-4 p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl h-full min-h-[180px]">
                  <div className={`text-5xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg`}>
                    {btn.icon}
                  </div>
                  <div className="text-white font-semibold text-lg leading-tight text-center">
                    {btn.label}
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${btn.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-16 text-center">
            <p className="text-blue-200/60 text-sm font-light">
              Last login: {formatDate(currentTime)} • Session active
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full backdrop-blur-xl bg-black/20 border-t border-white/10 text-center py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-blue-200/80">
              © {new Date().getFullYear()} Network18. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-blue-200/60 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                System Status: Operational
              </span>
              <span>Version 2.0</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}