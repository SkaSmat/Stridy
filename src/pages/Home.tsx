import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Route, Building2, Flame, Plus, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Mock data
const mockStats = [
  { icon: Route, label: "Distance totale", value: "127.3 km", color: "text-primary" },
  { icon: MapPin, label: "Rues explorées", value: "1,847", color: "text-secondary" },
  { icon: Building2, label: "Villes visitées", value: "8", color: "text-accent" },
  { icon: Flame, label: "Streak actuel", value: "12 jours", color: "text-orange-500" },
];

const mockCities = [
  { name: "Paris", flag: "🇫🇷", progress: 23, streets: 4521 },
  { name: "Lyon", flag: "🇫🇷", progress: 67, streets: 892 },
  { name: "Bordeaux", flag: "🇫🇷", progress: 15, streets: 678 },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session?.user) {
          navigate("/login");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "Explorer";

  return (
    <AppLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back 👋</p>
              <h1 className="text-xl font-bold">{username}</h1>
            </div>
          </div>
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors" aria-label="Notifications">
            <Bell className="w-6 h-6 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </header>

        {/* Stats Grid */}
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-4">
            {mockStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl border border-border p-4 card-hover"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cities Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Cities</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              See all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {mockCities.map((city) => (
              <Link
                key={city.name}
                to="/map"
                className="block bg-card rounded-2xl border border-border p-4 card-hover"
              >
                <div className="flex items-start gap-4">
                  {/* Mini map placeholder */}
                  <div className="w-20 h-20 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full grid grid-cols-4 gap-0.5 p-2">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            Math.random() > 0.6 ? "bg-primary/60" : "bg-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{city.flag}</span>
                      <h3 className="font-semibold text-lg">{city.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {city.streets.toLocaleString()} rues
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium text-secondary">{city.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all duration-500"
                          style={{ width: `${city.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </Link>
            ))}

            {/* Add City Button */}
            <Button
              variant="outline"
              className="w-full rounded-2xl py-6 border-dashed border-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add new city
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
