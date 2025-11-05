import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const serviceFees: Record<string, number> = {
  Lobe: 40,
  Cartilage: 55,
  Nostril: 60,
  Septum: 60,
  Eyebrow: 60,
  Lip: 60,
  Navel: 65,
  Nipple: 70
};

const jewelryRanges: Record<string, [number, number]> = {
  Titanium: [40, 80],
  '14k Gold': [120, 280],
  '18k Gold': [180, 360],
  'Gems & Diamonds': [90, 400]
};

export const PiercingEstimator = () => {
  const [area, setArea] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [material, setMaterial] = useState<string>('');

  const calculateEstimate = () => {
    if (!area || !quantity || !material) return null;

    const serviceFee = serviceFees[area];
    const qty = quantity === 'Single' ? 1 : 2;
    const [jewelryLow, jewelryHigh] = jewelryRanges[material];

    const serviceTotal = serviceFee * qty;
    const totalLow = serviceTotal + (jewelryLow * qty);
    const totalHigh = serviceTotal + (jewelryHigh * qty);

    return {
      serviceTotal,
      jewelryLow: jewelryLow * qty,
      jewelryHigh: jewelryHigh * qty,
      totalLow,
      totalHigh
    };
  };

  const estimate = calculateEstimate();

  return (
    <Card className="glass-panel-elevated glass-highlight border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl font-heading">Piercing Estimator</CardTitle>
        </div>
        <CardDescription>
          Calculate service fees and jewelry costs. Prices vary by material and design.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="area">Piercing Area</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger id="area">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(serviceFees).map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Select value={quantity} onValueChange={setQuantity}>
            <SelectTrigger id="quantity">
              <SelectValue placeholder="Select quantity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Pair">Pair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Jewelry Material</Label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger id="material">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(jewelryRanges).map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {estimate && (
          <div className="mt-6 glass-panel rounded-[16px] p-6 border-2 border-primary/30" role="status" aria-live="polite">
            <h4 className="font-semibold text-foreground mb-4">Estimated Total</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service Fee</span>
                <span className="font-semibold text-foreground">${estimate.serviceTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Jewelry (est.)</span>
                <span className="font-semibold text-foreground">${estimate.jewelryLow}–${estimate.jewelryHigh}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border/30">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="font-bold text-primary text-lg">${estimate.totalLow}–${estimate.totalHigh}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Tax applies to jewelry and retail items. Final pricing after consultation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
