import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Calendar, CreditCard, Users, Banknote, Minus
} from 'lucide-react';

interface TransactionBooking {
  id: string;
  client_name: string;
  phone_number: string;
  status: string;
  agreed_price: number | null;
  deposit_amount: number | null;
  deposit_paid: boolean | null;
  price_charged: number | null;
  payment_status: string | null;
  created_at: string;
  booking_slots: {
    slot_date: string;
    start_time: string;
    end_time: string;
    slot_number: number;
  };
}

const TransactionsManagement = () => {
  const [bookings, setBookings] = useState<TransactionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionBooking | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, client_name, phone_number, status, agreed_price, deposit_amount,
          deposit_paid, price_charged, payment_status, created_at,
          booking_slots!inner (slot_date, start_time, end_time, slot_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data as unknown as TransactionBooking[]) || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load transactions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const handleAddBalance = async () => {
    if (!selectedTx || !balanceAmount) return;
    setUpdating(true);
    try {
      const totalCharged = parseFloat(balanceAmount);
      const { error } = await supabase
        .from('bookings')
        .update({ price_charged: totalCharged, payment_status: 'paid' })
        .eq('id', selectedTx.id);

      if (error) throw error;
      toast({ title: 'Updated', description: 'Balance payment recorded successfully' });
      setBalanceDialogOpen(false);
      setSelectedTx(null);
      setBalanceAmount('');
      fetchAllBookings();
    } catch {
      toast({ title: 'Error', description: 'Failed to update payment', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  };

  // Weekly calculations
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const weeklyStats = useMemo(() => {
    const thisWeekBookings = bookings.filter(b => {
      const date = parseISO(b.booking_slots.slot_date);
      return isWithinInterval(date, { start: thisWeekStart, end: thisWeekEnd });
    });

    const lastWeekBookings = bookings.filter(b => {
      const date = parseISO(b.booking_slots.slot_date);
      return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
    });

    const thisWeekRevenue = thisWeekBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price_charged || 0), 0);

    const lastWeekRevenue = lastWeekBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price_charged || 0), 0);

    const thisWeekDeposits = thisWeekBookings
      .reduce((sum, b) => sum + (b.deposit_amount || 0), 0);

    const lastWeekDeposits = lastWeekBookings
      .reduce((sum, b) => sum + (b.deposit_amount || 0), 0);

    const revenueChange = lastWeekRevenue > 0
      ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100)
      : thisWeekRevenue > 0 ? 100 : 0;

    const clientsThisWeek = thisWeekBookings.length;
    const clientsLastWeek = lastWeekBookings.length;

    return {
      thisWeekRevenue,
      lastWeekRevenue,
      revenueChange,
      thisWeekDeposits,
      lastWeekDeposits,
      clientsThisWeek,
      clientsLastWeek,
    };
  }, [bookings, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd]);

  const totalOutstandingBalance = useMemo(() => {
    return bookings
      .filter(b => b.status === 'completed' && b.agreed_price && (!b.price_charged || b.price_charged < b.agreed_price))
      .reduce((sum, b) => sum + ((b.agreed_price || 0) - (b.price_charged || 0)), 0);
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Transactions & Revenue
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track all payments, deposits, balances and weekly performance
        </p>
      </div>

      {/* Weekly Comparison Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">This Week Revenue</p>
              <p className="text-2xl font-bold text-green-500">
                KSh {weeklyStats.thisWeekRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {weeklyStats.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={weeklyStats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(weeklyStats.revenueChange).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Last Week Revenue</p>
              <p className="text-2xl font-bold text-blue-500">
                KSh {weeklyStats.lastWeekRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {weeklyStats.clientsLastWeek} clients
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Clients This Week</p>
              <p className="text-2xl font-bold text-primary">{weeklyStats.clientsThisWeek}</p>
              <p className="text-xs text-muted-foreground">
                Deposits: KSh {weeklyStats.thisWeekDeposits.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Outstanding Balance</p>
              <p className="text-2xl font-bold text-yellow-500">
                KSh {totalOutstandingBalance.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Unpaid balances</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="glass-panel-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            All Transactions ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Agreed Price</TableHead>
                  <TableHead className="text-right">Deposit</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const agreed = booking.agreed_price || 0;
                  const deposit = booking.deposit_amount || 0;
                  const paid = booking.price_charged || 0;
                  const balance = agreed > 0 ? Math.max(agreed - paid, 0) : 0;
                  const isFullyPaid = agreed > 0 && paid >= agreed;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(parseISO(booking.booking_slots.slot_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{booking.client_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.phone_number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatTime(booking.booking_slots.start_time)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={booking.status === 'completed' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}
                          className={
                            booking.status === 'completed' ? 'bg-green-500/80' :
                            booking.status === 'ongoing' ? 'bg-yellow-500' : ''
                          }
                        >
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {agreed > 0 ? `KSh ${agreed.toLocaleString()}` : <Minus className="h-4 w-4 mx-auto text-muted-foreground" />}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {deposit > 0 ? (
                          <span className="text-green-500">KSh {deposit.toLocaleString()}</span>
                        ) : (
                          <Minus className="h-4 w-4 mx-auto text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {paid > 0 ? `KSh ${paid.toLocaleString()}` : <Minus className="h-4 w-4 mx-auto text-muted-foreground" />}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {isFullyPaid ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">Paid</Badge>
                        ) : balance > 0 ? (
                          <span className="text-yellow-500 font-medium">KSh {balance.toLocaleString()}</span>
                        ) : (
                          <Minus className="h-4 w-4 mx-auto text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.status === 'completed' && !isFullyPaid && agreed > 0 && (
                          <Dialog
                            open={balanceDialogOpen && selectedTx?.id === booking.id}
                            onOpenChange={setBalanceDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary/50 text-primary hover:bg-primary/10"
                                onClick={() => {
                                  setSelectedTx(booking);
                                  setBalanceAmount(String(agreed));
                                }}
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Record Payment
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm glass-panel-elevated border-primary/20">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <DollarSign className="h-5 w-5 text-primary" />
                                  Record Balance Payment
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-2">
                                <div className="glass-panel rounded-xl p-4 space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Client</span>
                                    <span className="font-medium">{selectedTx?.client_name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Agreed Price</span>
                                    <span>KSh {agreed.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Deposit Paid</span>
                                    <span className="text-green-500">KSh {deposit.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-border/30 pt-2">
                                    <span className="text-muted-foreground">Remaining</span>
                                    <span className="font-bold text-yellow-500">KSh {balance.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Total Amount Paid (KSh)</label>
                                  <Input
                                    type="number"
                                    value={balanceAmount}
                                    onChange={(e) => setBalanceAmount(e.target.value)}
                                    placeholder={String(agreed)}
                                    className="bg-background/50"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter the total amount paid including deposit
                                  </p>
                                </div>
                                <Button
                                  onClick={handleAddBalance}
                                  disabled={updating}
                                  className="w-full bg-green-500 hover:bg-green-600"
                                >
                                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                  Confirm Payment
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsManagement;
