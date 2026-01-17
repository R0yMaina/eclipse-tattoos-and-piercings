import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { PopularQuestions } from "@/components/admin/PopularQuestions";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { SecurityMonitor } from "@/components/admin/SecurityMonitor";
import BookingsManagement from "@/components/admin/BookingsManagement";
import SlotConfiguration from "@/components/admin/SlotConfiguration";
import MessageTemplates from "@/components/admin/MessageTemplates";
import ReviewsManagement from "@/components/admin/ReviewsManagement";
import { Shield, TrendingUp, MessageSquare, Star, LogOut, RefreshCw, ShieldAlert, Calendar, Clock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        } else {
          setTimeout(() => checkAdminAccess(session.user.id), 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkAdminAccess(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminAccess = async (userId: string) => {
    try {
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error || roleData?.role !== "admin") {
        toast({ title: "Access Denied", description: "You don't have admin privileges.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No active session");
      const { error } = await supabase.functions.invoke("rag-reindex", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      toast({ title: "Reindex started", description: "The knowledge base is being reindexed." });
    } catch (error: any) {
      toast({ title: "Reindex failed", description: error.message || "Failed to trigger reindex", variant: "destructive" });
    } finally {
      setReindexing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReindex} disabled={reindexing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${reindexing ? "animate-spin" : ""}`} />
                Reindex
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="bookings"><Calendar className="h-4 w-4 mr-1" />Bookings</TabsTrigger>
            <TabsTrigger value="slots"><Clock className="h-4 w-4 mr-1" />Slots</TabsTrigger>
            <TabsTrigger value="messages"><Mail className="h-4 w-4 mr-1" />Messages</TabsTrigger>
            <TabsTrigger value="reviews"><Star className="h-4 w-4 mr-1" />Reviews</TabsTrigger>
            <TabsTrigger value="analytics"><TrendingUp className="h-4 w-4 mr-1" />Analytics</TabsTrigger>
            <TabsTrigger value="security"><ShieldAlert className="h-4 w-4 mr-1" />Security</TabsTrigger>
            <TabsTrigger value="questions"><MessageSquare className="h-4 w-4 mr-1" />Questions</TabsTrigger>
            <TabsTrigger value="feedback"><Star className="h-4 w-4 mr-1" />Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings"><BookingsManagement /></TabsContent>
          <TabsContent value="slots"><SlotConfiguration /></TabsContent>
          <TabsContent value="messages"><MessageTemplates /></TabsContent>
          <TabsContent value="reviews"><ReviewsManagement /></TabsContent>
          <TabsContent value="analytics"><AnalyticsOverview /></TabsContent>
          <TabsContent value="security"><SecurityMonitor /></TabsContent>
          <TabsContent value="questions"><PopularQuestions /></TabsContent>
          <TabsContent value="feedback"><FeedbackList /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
