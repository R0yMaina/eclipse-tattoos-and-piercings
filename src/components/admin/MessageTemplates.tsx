import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('template_type');
      
      if (error) throw error;
      setTemplates(data || []);
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
  };

  const updateTemplate = (id: string, field: keyof MessageTemplate, value: any) => {
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
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Available Variables</p>
              <p className="text-muted-foreground">
                Use these placeholders in your templates:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{'{{client_name}}'}</Badge>
                <Badge variant="outline">{'{{date}}'}</Badge>
                <Badge variant="outline">{'{{time}}'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {templates.map((template) => (
        <Card key={template.id} className="bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {getTemplateLabel(template.template_type)}
                </CardTitle>
                <CardDescription>
                  {getTemplateDescription(template.template_type)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`active-${template.id}`} className="text-sm">
                  Active
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
              className="font-mono text-sm"
              disabled={!template.is_active}
            />
            
            <Button
              onClick={() => saveTemplate(template)}
              disabled={saving === template.id}
              size="sm"
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
  );
};

export default MessageTemplates;
