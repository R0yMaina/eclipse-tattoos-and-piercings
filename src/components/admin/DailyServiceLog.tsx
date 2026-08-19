import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAdminAction } from '@/lib/auditLog';
import { Loader2, Plus, Trash2, Banknote, ClipboardList, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  log_date: string;
  service_type: string;
  client_name: string;
  phone_number: string | null;
  amount_paid: number;
  payment_method: string | null;
  notes: string | null;
  service_rating: number | null;
  created_at: string;
}

const emptyForm = {
  service_type: '',
  client_name: '',
  phone_number: '',
  amount_paid: '',
  payment_method: '',
  notes: '',
};

const DailyServiceLog = () => {
  const { toast } = useToast();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('daily_service_log')
      .select('*')
      .eq('log_date', date)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: 'Failed to load the day\u2019s records', variant: 'destructive' });
    } else {
      setEntries((data as LogEntry[]) ?? []);
    }
    setLoading(false);
  }, [date, toast]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + Number(e.amount_paid || 0), 0),
    [entries],
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount_paid);
    if (!form.service_type.trim() || !form.client_name.trim()) {
      toast({ title: 'Missing details', description: 'Service type and name are required.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(amount) || amount < 0 || amount >= 1_000_000) {
      toast({ title: 'Invalid amount', description: 'Enter a valid amount in KES.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('daily_service_log').insert([{
      log_date: date,
      service_type: form.service_type.trim().slice(0, 100),
      client_name: form.client_name.trim().slice(0, 100),
      phone_number: form.phone_number.trim().slice(0, 20) || null,
      amount_paid: amount,
      payment_method: form.payment_method.trim().slice(0, 40) || null,
      notes: form.notes.trim().slice(0, 500) || null,
      service_rating: rating > 0 ? rating : null,
      created_by: user?.id ?? null,
    }]);
    setSaving(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    await logAdminAction('daily_log_entry_created', 'daily_service_log', null, { log_date: date, amount });
    setForm(emptyForm);
    toast({ title: 'Recorded', description: 'Entry added to the day\u2019s log.' });
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('daily_service_log').delete().eq('id', id);
    if (error) {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
      return;
    }
    await logAdminAction('daily_log_entry_deleted', 'daily_service_log', id);
    fetchEntries();
  };

  const kes = (n: number) => `KES ${n.toLocaleString('en-KE')}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Entries
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{entries.length}</p></CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Total for the day
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary">{kes(total)}</p></CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader><CardTitle>Add a record</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dsl-service">Type of service</Label>
              <Input id="dsl-service" value={form.service_type} maxLength={100}
                placeholder="e.g. Small tattoo, Nose piercing"
                onChange={(e) => setForm({ ...form, service_type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dsl-name">Client name</Label>
              <Input id="dsl-name" value={form.client_name} maxLength={100}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dsl-phone">Phone number</Label>
              <Input id="dsl-phone" value={form.phone_number} maxLength={20} placeholder="07XXXXXXXX"
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dsl-amount">Amount paid (KES)</Label>
              <Input id="dsl-amount" type="number" min="0" step="1" value={form.amount_paid}
                onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dsl-method">Payment method</Label>
              <Input id="dsl-method" value={form.payment_method} maxLength={40} placeholder="M-Pesa / Cash"
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dsl-notes">Notes (optional)</Label>
              <Textarea id="dsl-notes" rows={1} value={form.notes} maxLength={500}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add to log
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Records for {format(new Date(`${date}T00:00:00`), 'PPP')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center">No records for this day yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.service_type}</TableCell>
                      <TableCell>{e.client_name}</TableCell>
                      <TableCell>{e.phone_number ?? '—'}</TableCell>
                      <TableCell>{e.payment_method ?? '—'}</TableCell>
                      <TableCell className="text-right">{kes(Number(e.amount_paid))}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" aria-label="Delete record"
                          onClick={() => handleDelete(e.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="font-semibold">Day total</TableCell>
                    <TableCell className="text-right font-bold text-primary">{kes(total)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyServiceLog;
