import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Save, Info } from 'lucide-react';

interface MessageTemplate {
  id: string;
  template_type: string;
  template_content: string;
  is_active: boolean;
}

const MessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('template_type');

      if (error) throw error;
      setTemplates((data as MessageTemplate[]) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const updateTemplate = (id: string, field: keyof MessageTemplate, value: string | boolean) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const saveTemplate = async (template: MessageTemplate) => {
    setSaving(template.id);
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          template_content: template.template_content,
          is_active: template.is_active
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: 'Template saved',
        description: `${getTemplateLabel(template.template_type)} template updated.`,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    } finally {
      setSaving(null);
    }
  };

  const getTemplateLabel = (type: string) => {
    switch (type) {
      case 'confirmation': return 'Booking Confirmation';
      case 'reminder': return 'Appointment Reminder';
      case 'late_warning': return 'Late Warning';
      default: return type;
    }
  };

  const getTemplateDescription = (type: string) => {
    switch (type) {
      case 'confirmation': return 'Sent immediately after a booking is made';
      case 'reminder': return 'Sent before the appointment time';
      case 'late_warning': return 'Sent if the client is more than 15 minutes late';
      default: return '';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Message Templates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure automated WhatsApp messages</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="glass-panel border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium mb-1 text-foreground">Available Variables</p>
              <p className="text-muted-foreground">
                Use these placeholders in your templates:
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="bg-background/50 border-primary/30 text-primary">{'{{client_name}}'}</Badge>
                <Badge variant="outline" className="bg-background/50 border-primary/30 text-primary">{'{{date}}'}</Badge>
                <Badge variant="outline" className="bg-background/50 border-primary/30 text-primary">{'{{time}}'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="glass-panel-elevated hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${template.is_active
                      ? 'bg-primary/20'
                      : 'bg-muted'
                    }`}>
                    <MessageSquare className={`h-5 w-5 ${template.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {getTemplateLabel(template.template_type)}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {getTemplateDescription(template.template_type)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`active-${template.id}`} className="text-xs text-muted-foreground">
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Label>
                  <Switch
                    id={`active-${template.id}`}
                    checked={template.is_active}
                    onCheckedChange={(checked) => updateTemplate(template.id, 'is_active', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={template.template_content}
                onChange={(e) => updateTemplate(template.id, 'template_content', e.target.value)}
                rows={4}
                className={`font-mono text-sm bg-background/50 border-border/50 focus:border-primary/50 transition-colors ${!template.is_active ? 'opacity-50' : ''
                  }`}
                disabled={!template.is_active}
              />

              <Button
                onClick={() => saveTemplate(template)}
                disabled={saving === template.id}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {saving === template.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No message templates configured</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessageTemplates;
