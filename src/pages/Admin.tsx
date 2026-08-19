import { useEffect, useState, useCallback } from "react";
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
import TransactionsManagement from "@/components/admin/TransactionsManagement";
import GalleryManagement from "@/components/admin/GalleryManagement";
import PaymentVerification from "@/components/admin/PaymentVerification";
import DailyServiceLog from "@/components/admin/DailyServiceLog";
import {
  Shield, TrendingUp, MessageSquare, Star, LogOut, RefreshCw,
  ShieldAlert, Calendar, Clock, Mail, Sparkles, CreditCard, ImageIcon, Banknote, Plus, ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [reindexing, setReindexing] = useState(false);

  const checkAdminAccess = useCallback(async (userId: string, email: string | undefined) => {
    try {
      // Hardened check: Only allow specific emails
      const allowedEmails = ['roymaina395@gmail.com', 'jamingtonbuluma17@gmail.com'];
      if (!email || !allowedEmails.includes(email.toLowerCase())) {
        toast({ 
          title: "Access Denied", 
          description: "This account is not authorized to access the admin dashboard.", 
          variant: "destructive" 
        });
        navigate("/auth");
        return;
      }

      const isOwner = email.toLowerCase() === "jamingtonbuluma17@gmail.com";

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if ((error || roleData?.role !== "admin") && !isOwner) {
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
  }, [navigate, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (!currentUser) {
          navigate("/auth");
        } else {
          setTimeout(() => checkAdminAccess(currentUser.id, currentUser.email), 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        navigate("/auth");
      } else {
        checkAdminAccess(currentUser.id, currentUser.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, checkAdminAccess]);

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to trigger reindex";
      toast({ title: "Reindex failed", description: message, variant: "destructive" });
    } finally {
      setReindexing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header with Glass Effect */}
      <header className="sticky top-16 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg gold-glow">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReindex}
                disabled={reindexing}
                className="glass-panel hover:gold-glow transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reindexing ? "animate-spin" : ""}`} />
                Refresh AI
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="payments" className="space-y-8">
          {/* Modern Tab Navigation */}
          <div className="glass-panel rounded-2xl p-2 overflow-x-auto no-scrollbar">
            <TabsList className="w-full flex flex-nowrap gap-1 bg-transparent h-auto p-0 min-w-max">
              <TabsTrigger
                value="payments"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <Banknote className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Approvals</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger
                value="daily-log"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Daily Log</span>
              </TabsTrigger>
              <TabsTrigger
                value="manual-booking"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manual Booking</span>
              </TabsTrigger>
              <TabsTrigger
                value="slots"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Slots</span>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <Star className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Questions</span>
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <Star className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all duration-200"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content with Animation */}
          <div className="animate-fade-in">
            <TabsContent value="payments" className="mt-0"><PaymentVerification /></TabsContent>
            <TabsContent value="transactions" className="mt-0"><TransactionsManagement /></TabsContent>
            <TabsContent value="bookings" className="mt-0"><BookingsManagement /></TabsContent>
            <TabsContent value="daily-log" className="mt-0"><DailyServiceLog /></TabsContent>
            <TabsContent value="manual-booking" className="mt-0"><BookingsManagement /></TabsContent>
            <TabsContent value="slots" className="mt-0"><SlotConfiguration /></TabsContent>
            <TabsContent value="messages" className="mt-0"><MessageTemplates /></TabsContent>
            <TabsContent value="reviews" className="mt-0"><ReviewsManagement /></TabsContent>
            <TabsContent value="analytics" className="mt-0"><AnalyticsOverview /></TabsContent>
            <TabsContent value="security" className="mt-0"><SecurityMonitor /></TabsContent>
            <TabsContent value="questions" className="mt-0"><PopularQuestions /></TabsContent>
            <TabsContent value="feedback" className="mt-0"><FeedbackList /></TabsContent>
            <TabsContent value="gallery" className="mt-0"><GalleryManagement /></TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}