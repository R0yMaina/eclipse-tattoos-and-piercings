import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { PopularQuestions } from "@/components/admin/PopularQuestions";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { Shield, TrendingUp, MessageSquare, Star, LogOut, RefreshCw } from "lucide-react";
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
          setTimeout(() => {
            checkAdminAccess(session.user.id);
          }, 0);
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
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
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
      
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const { error } = await supabase.functions.invoke("rag-reindex", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Reindex started",
        description: "The knowledge base is being reindexed.",
      });
    } catch (error: any) {
      toast({
        title: "Reindex failed",
        description: error.message || "Failed to trigger reindex",
        variant: "destructive",
      });
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleReindex}
                disabled={reindexing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reindexing ? "animate-spin" : ""}`} />
                Reindex Knowledge Base
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsOverview />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <PopularQuestions />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
