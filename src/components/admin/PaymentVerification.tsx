import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, Phone, User, CreditCard, AlertTriangle } from 'lucide-react';

interface PendingBooking {
  id: string;
  client_name: string;
  phone_number: string;
  agreed_price: number | null;
  deposit_amount: number | null;
  transaction_code: string | null;
  payment_phone: string | null;
  payment_status: string | null;
  status: string;
  created_at: string;
  booking_slots: {
    slot_date: string;
    start_time: string;
    end_time: string;
    slot_number: number;
  };
}

const PaymentVerification = () => {
  const [bookings, setBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, client_name, phone_number, agreed_price, deposit_amount,
          transaction_code, payment_phone, payment_status, status, created_at,
          booking_slots!inner (slot_date, start_time, end_time, slot_number)
        `)
        .in('status', ['pending_payment', 'pending_verification'] as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data as unknown as PendingBooking[]) || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load pending payments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  const handleVerify = async (bookingId: string, action: 'confirm' | 'reject') => {
    setUpdating(bookingId);
    try {
      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
      const newPaymentStatus = action === 'confirm' ? 'paid' : 'rejected';

      const updateData: Record<string, unknown> = {
        status: newStatus,
        payment_status: newPaymentStatus,
      };
      if (action === 'confirm') {
        updateData.deposit_paid = true;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: action === 'confirm' ? 'Payment Confirmed ✅' : 'Payment Rejected',
        description: action === 'confirm'
          ? 'Booking has been confirmed. The client will be notified.'
          : 'Booking has been rejected and cancelled.',
      });

      fetchPendingPayments();
    } catch {
      toast({ title: 'Error', description: `Failed to ${action} payment`, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  };

  const pendingVerification = bookings.filter(b => b.status === 'pending_verification');
  const waitingPayment = bookings.filter(b => b.status === 'pending_payment');

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
          Payment Verification
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Review and verify M-Pesa deposit payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-panel bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingVerification.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Waiting for Payment</p>
                <p className="text-2xl font-bold text-blue-500">{waitingPayment.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verification Table */}
      {pendingVerification.length > 0 && (
        <Card className="glass-panel-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Awaiting Verification ({pendingVerification.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Transaction Code</TableHead>
                    <TableHead>Payment Phone</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVerification.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{booking.client_name}</p>
                            <p className="text-xs text-muted-foreground">{booking.phone_number}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        <div>
                          <p>{format(parseISO(booking.booking_slots.slot_date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(booking.booking_slots.start_time)} – {formatTime(booking.booking_slots.end_time)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        KES {(booking.deposit_amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-sm tracking-wider">
                          {booking.transaction_code || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {booking.payment_phone || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(parseISO(booking.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm"
                            onClick={() => handleVerify(booking.id, 'confirm')}
                            disabled={updating === booking.id}
                            className="bg-green-600 hover:bg-green-700 text-white">
                            {updating === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" /> Confirm</>}
                          </Button>
                          <Button size="sm" variant="outline"
                            onClick={() => handleVerify(booking.id, 'reject')}
                            disabled={updating === booking.id}
                            className="border-destructive text-destructive hover:bg-destructive/10">
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting for Payment Table */}
      {waitingPayment.length > 0 && (
        <Card className="glass-panel-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Waiting for Payment ({waitingPayment.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPayment.map((booking) => (
                    <TableRow key={booking.id} className="opacity-70">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{booking.client_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.phone_number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(parseISO(booking.booking_slots.slot_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm">
                        KES {(booking.deposit_amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" /> Waiting
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(parseISO(booking.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {bookings.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="py-12 text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">All clear!</p>
            <p className="text-sm mt-1">No pending payments to verify</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentVerification;
