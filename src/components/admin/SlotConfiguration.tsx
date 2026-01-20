import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Save } from 'lucide-react';

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
const ACTIVE_DAYS = [1, 2, 3, 4, 5, 6]; // Monday through Saturday

const SlotConfiguration = () => {
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchSlotConfiguration();
  }, []);

  const fetchSlotConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_configuration')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('slot_number', { ascending: true });
      
      if (error) throw error;
      setSlots(data || []);
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
  };

  const updateSlot = (id: string, field: keyof SlotConfig, value: any) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Weekly Slot Configuration
          </CardTitle>
          <CardDescription>
            Configure booking slots for each day. Closed on Sundays. Each slot is ~45 minutes by default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
            <TabsList className="grid grid-cols-6 mb-4">
              {ACTIVE_DAYS.map(day => (
                <TabsTrigger key={day} value={day.toString()} className="text-xs sm:text-sm">
                  {DAY_NAMES[day].slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {ACTIVE_DAYS.map(day => (
              <TabsContent key={day} value={day.toString()} className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-semibold">{DAY_NAMES[day]}</span>
                  <span className="text-sm text-muted-foreground">{getDayHours(day)}</span>
                </div>

                <div className="grid gap-3">
                  {getDaySlots(day).map((slot) => (
                    <div 
                      key={slot.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-opacity ${
                        slot.is_active ? 'bg-background/50' : 'bg-muted/30 opacity-50'
                      }`}
                    >
                      <div className="w-10 text-center font-bold text-sm text-primary">
                        #{slot.slot_number}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Start</Label>
                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateSlot(slot.id, 'start_time', e.target.value)}
                            className="w-28"
                            disabled={!slot.is_active}
                          />
                        </div>
                        
                        <span className="text-muted-foreground mt-5">–</span>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">End</Label>
                          <Input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateSlot(slot.id, 'end_time', e.target.value)}
                            className="w-28"
                            disabled={!slot.is_active}
                          />
                        </div>

                        <div className="space-y-1 ml-2">
                          <Label className="text-xs text-muted-foreground">Duration (min)</Label>
                          <Input
                            type="number"
                            min={30}
                            max={120}
                            value={slot.duration_minutes}
                            onChange={(e) => updateSlot(slot.id, 'duration_minutes', parseInt(e.target.value) || 45)}
                            className="w-20"
                            disabled={!slot.is_active}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
          
          <Button
            onClick={saveConfiguration}
            disabled={saving}
            className="mt-6 w-full md:w-auto"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlotConfiguration;
