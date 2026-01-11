import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  HelpCircle, 
  Shield, 
  LogOut, 
  ChevronRight,
  Route,
  MapPin,
  Building2,
  Flame,
  Calendar,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const mockStats = [
  { icon: Route, label: "Distance totale", value: "127.3 km" },
  { icon: MapPin, label: "Rues explorées", value: "1,847" },
  { icon: Building2, label: "Villes visitées", value: "8" },
  { icon: Flame, label: "Streak actuel", value: "12 jours" },
  { icon: Calendar, label: "Membre depuis", value: "Mars 2024" },
  { icon: Award, label: "Badges obtenus", value: "14" },
];

const mockBadges = [
  { id: 1, name: "First Steps", icon: "🚶", unlocked: true, date: "15 mars 2024" },
  { id: 2, name: "10 km Walker", icon: "🏃", unlocked: true, date: "22 mars 2024" },
  { id: 3, name: "Night Owl", icon: "🦉", unlocked: true, date: "5 avril 2024" },
  { id: 4, name: "Early Bird", icon: "🐦", unlocked: true, date: "12 avril 2024" },
  { id: 5, name: "City Master", icon: "🏙️", unlocked: false, date: null },
  { id: 6, name: "Marathon", icon: "🏅", unlocked: false, date: null },
];

const settingsItems = [
  { icon: Settings, label: "Préférences", href: "#preferences" },
  { icon: Shield, label: "Confidentialité", href: "#privacy" },
  { icon: HelpCircle, label: "Aide", href: "#help" },
];

export default function Profile() {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

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
  const email = user?.email || "";

  return (
    <AppLayout>
      <div className="px-6 py-8">
        {/* Profile Header */}
        <header className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl">
            {username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mb-1">{username}</h1>
          <p className="text-muted-foreground text-sm mb-4">{email}</p>
          <Button variant="outline" size="sm" className="rounded-xl">
            Modifier le profil
          </Button>
        </header>

        {/* Stats Grid */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
          <div className="grid grid-cols-2 gap-3">
            {mockStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Badges</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              See all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {mockBadges.map((badge) => (
              <div
                key={badge.id}
                className={`bg-card rounded-xl border border-border p-4 text-center transition-all ${
                  badge.unlocked ? "card-hover" : "opacity-50 grayscale"
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-xs font-medium truncate">{badge.name}</p>
                {badge.unlocked && badge.date && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {badge.date}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Settings Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Paramètres</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {settingsItems.map((item, index) => (
              <button
                key={item.label}
                className={`w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors ${
                  index !== settingsItems.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </AppLayout>
  );
}
