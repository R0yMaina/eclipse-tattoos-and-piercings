import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Save } from 'lucide-react';

interface SlotConfig {
  id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const SlotConfiguration = () => {
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSlotConfiguration();
  }, []);

  const fetchSlotConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_configuration')
        .select('*')
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

  const updateSlot = (slotNumber: number, field: keyof SlotConfig, value: any) => {
    setSlots(prev => prev.map(slot => 
      slot.slot_number === slotNumber ? { ...slot, [field]: value } : slot
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
            is_active: slot.is_active
          })
          .eq('slot_number', slot.slot_number);
        
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
            Daily Slot Configuration
          </CardTitle>
          <CardDescription>
            Configure the 15 available booking slots per day. These times will be used when generating new slots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {slots.map((slot) => (
              <div 
                key={slot.slot_number}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-opacity ${
                  slot.is_active ? 'bg-background/50' : 'bg-muted/30 opacity-50'
                }`}
              >
                <div className="w-12 text-center font-bold text-lg text-primary">
                  #{slot.slot_number}
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Start</Label>
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => updateSlot(slot.slot_number, 'start_time', e.target.value)}
                      className="w-32"
                      disabled={!slot.is_active}
                    />
                  </div>
                  
                  <span className="text-muted-foreground mt-6">to</span>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">End</Label>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => updateSlot(slot.slot_number, 'end_time', e.target.value)}
                      className="w-32"
                      disabled={!slot.is_active}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${slot.slot_number}`} className="text-sm">
                    Active
                  </Label>
                  <Switch
                    id={`active-${slot.slot_number}`}
                    checked={slot.is_active}
                    onCheckedChange={(checked) => updateSlot(slot.slot_number, 'is_active', checked)}
                  />
                </div>
              </div>
            ))}
          </div>
          
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
