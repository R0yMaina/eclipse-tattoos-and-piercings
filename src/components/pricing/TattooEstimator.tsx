import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const sizeMap: Record<string, number> = {
  'Micro (≤2")': 0.75,
  'Small (2–4")': 1.5,
  'Medium (4–6")': 3.0,
  'Large (6–10")': 5.0,
  'XL (10"+)': 8.0
};

const complexityMult: Record<string, number> = { Low: 0.9, Medium: 1.0, High: 1.25 };
const paletteMult: Record<string, number> = { 'Black & Grey': 1.0, Color: 1.2 };
const placementMult: Record<string, number> = { Standard: 1.0, Challenging: 1.15 };

const tierRates: Record<string, { low: number; high: number }> = {
  Standard: { low: 200, high: 240 },
  Senior: { low: 240, high: 280 },
  Lead: { low: 280, high: 320 }
};

export const TattooEstimator = () => {
  const [size, setSize] = useState<string>('');
  const [complexity, setComplexity] = useState<string>('');
  const [palette, setPalette] = useState<string>('');
  const [placement, setPlacement] = useState<string>('');
  const [tier, setTier] = useState<string>('');

  const calculateEstimate = () => {
    if (!size || !complexity || !palette || !placement || !tier) return null;

    const baseHours = sizeMap[size];
    const hours = Math.max(0.5, Math.min(10, 
      baseHours * complexityMult[complexity] * paletteMult[palette] * placementMult[placement]
    ));

    const rates = tierRates[tier];
    const priceLow = Math.max(120, Math.round((hours * rates.low * 0.9) / 10) * 10);
    const priceHigh = Math.round((hours * rates.high * 1.1) / 10) * 10;
    const deposit = Math.round((((priceLow + priceHigh) / 2) * 0.2) / 10) * 10;

    return {
      hoursLow: hours.toFixed(1),
      hoursHigh: (hours * 1.2).toFixed(1),
      priceLow,
      priceHigh,
      deposit
    };
  };

  const estimate = calculateEstimate();

  return (
    <Card className="glass-panel-elevated glass-highlight border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl font-heading">Tattoo Estimator</CardTitle>
        </div>
        <CardDescription>
          Get a rough estimate based on your preferences. Final quotes follow consultation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger id="size">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(sizeMap).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complexity">Complexity</Label>
          <Select value={complexity} onValueChange={setComplexity}>
            <SelectTrigger id="complexity">
              <SelectValue placeholder="Select complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="palette">Palette</Label>
          <Select value={palette} onValueChange={setPalette}>
            <SelectTrigger id="palette">
              <SelectValue placeholder="Select palette" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Black & Grey">Black & Grey</SelectItem>
              <SelectItem value="Color">Color</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="placement">Placement</Label>
          <Select value={placement} onValueChange={setPlacement}>
            <SelectTrigger id="placement">
              <SelectValue placeholder="Select placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Challenging">Challenging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tier">Artist Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger id="tier">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {estimate && (
          <div className="mt-6 glass-panel rounded-[16px] p-6 border-2 border-primary/30" role="status" aria-live="polite">
            <h4 className="font-semibold text-foreground mb-4">Estimated Range</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated Hours</span>
                <span className="font-semibold text-foreground">{estimate.hoursLow}–{estimate.hoursHigh}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated Price</span>
                <span className="font-bold text-primary text-lg">KES{estimate.priceLow}–KES{estimate.priceHigh}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border/30">
                <span className="text-sm text-muted-foreground">Suggested Deposit (20%)</span>
                <span className="font-semibold text-foreground">KES{estimate.deposit}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              This is an estimate. Final quote provided after consultation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
