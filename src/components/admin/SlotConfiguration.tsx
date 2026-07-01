import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Save, CheckCircle, Calendar } from 'lucide-react';

interface SlotConfig {
  id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  day_of_week: number;
  duration_minutes: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ACTIVE_DAYS = [1, 2, 3, 4, 5, 6]; // Monday through Saturday

const SlotConfiguration = () => {
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const { toast } = useToast();

  const fetchSlotConfiguration = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('slot_configuration')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('slot_number', { ascending: true });

      if (error) throw error;
      setSlots((data as SlotConfig[]) || []);
    } catch (error) {
      console.error('Error fetching slot configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load slot configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSlotConfiguration();
  }, [fetchSlotConfiguration]);

  const updateSlot = (id: string, field: keyof SlotConfig, value: string | boolean | number) => {
    setSlots(prev => prev.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      for (const slot of slots) {
        const { error } = await supabase
          .from('slot_configuration')
          .update({
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: slot.is_active,
            duration_minutes: slot.duration_minutes
          })
          .eq('id', slot.id);

        if (error) throw error;
      }

      toast({
        title: 'Configuration saved',
        description: 'Slot times have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getDaySlots = (dayOfWeek: number) => {
    return slots.filter(slot => slot.day_of_week === dayOfWeek);
  };

  const getDayHours = (dayOfWeek: number) => {
    if (dayOfWeek === 6) return "11:00 AM - 5:30 PM";
    return "10:00 AM - 6:30 PM";
  };

  const getActiveSlotCount = (dayOfWeek: number) => {
    return getDaySlots(dayOfWeek).filter(s => s.is_active).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Slot Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure booking slots for each day. Closed on Sundays.</p>
        </div>
        <Button
          onClick={saveConfiguration}
          disabled={saving}
          className="gold-glow"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Card className="glass-panel-elevated">
        <CardContent className="pt-6">
          <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
            {/* Day Tabs */}
            <div className="glass-panel rounded-xl p-1.5 mb-6">
              <TabsList className="w-full grid grid-cols-6 bg-transparent h-auto gap-1">
                {ACTIVE_DAYS.map(day => (
                  <TabsTrigger
                    key={day}
                    value={day.toString()}
                    className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200"
                  >
                    <span className="text-xs font-medium">{DAY_SHORT[day]}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground data-[state=active]:border-primary-foreground/30"
                    >
                      {getActiveSlotCount(day)} slots
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {ACTIVE_DAYS.map(day => (
              <TabsContent key={day} value={day.toString()} className="space-y-4 mt-0">
                {/* Day Info Header */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-lg">{DAY_NAMES[day]}</span>
                      <p className="text-sm text-muted-foreground">{getDayHours(day)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    {getActiveSlotCount(day)} active slots
                  </Badge>
                </div>

                {/* Slots Grid */}
                <div className="grid gap-3">
                  {getDaySlots(day).map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${slot.is_active
                          ? 'bg-card/50 border-border/50 hover:border-primary/30'
                          : 'bg-muted/20 border-border/30 opacity-60'
                        }`}
                    >
                      {/* Slot Number */}
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm ${slot.is_active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                        }`}>
                        #{slot.slot_number}
                      </div>

                      {/* Time Inputs */}
                      <div className="flex items-center gap-3 flex-1 flex-wrap">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Start Time</Label>
                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateSlot(slot.id, 'start_time', e.target.value)}
                            className="w-28 bg-background/50"
                            disabled={!slot.is_active}
                          />
                        </div>

                        <span className="text-muted-foreground mt-5">→</span>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">End Time</Label>
                          <Input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateSlot(slot.id, 'end_time', e.target.value)}
                            className="w-28 bg-background/50"
                            disabled={!slot.is_active}
                          />
                        </div>

                        <div className="space-y-1 ml-2">
                          <Label className="text-xs text-muted-foreground">Duration</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={60}
                              max={60}
                              value={slot.duration_minutes}
                              onChange={(e) => updateSlot(slot.id, 'duration_minutes', parseInt(e.target.value) || 60)}
                              className="w-16 bg-background/50"
                              disabled={!slot.is_active}
                            />
                            <span className="text-xs text-muted-foreground">min</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center gap-3">
                        <Label htmlFor={`active-${slot.id}`} className="text-sm text-muted-foreground">
                          {slot.is_active ? 'Active' : 'Inactive'}
                        </Label>
                        <Switch
                          id={`active-${slot.id}`}
                          checked={slot.is_active}
                          onCheckedChange={(checked) => updateSlot(slot.id, 'is_active', checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlotConfiguration;