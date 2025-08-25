import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import { LeadFilters as LeadFiltersType, LeadSource, LeadStatus } from '@/types/lead';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof LeadFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateNestedFilter = (key: 'score' | 'lead_value' | 'created_at' | 'last_activity_at', subKey: string, value: any) => {
    const currentFilter = filters[key] || {};
    onFiltersChange({
      ...filters,
      [key]: { ...currentFilter, [subKey]: value || undefined }
    });
  };

  const toggleArrayFilter = <T extends LeadStatus | LeadSource>(
    key: T extends LeadStatus ? 'status' : 'source', 
    value: T
  ) => {
    const currentArray = (filters[key] as T[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(filters).forEach(value => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (typeof value === 'object' && Object.values(value).some(v => v !== undefined)) count++;
        else if (typeof value === 'boolean' || (typeof value === 'string' && value !== '')) count++;
      }
    });
    return count;
  };

  const sourceOptions: { value: LeadSource; label: string }[] = [
    { value: 'website', label: 'Website' },
    { value: 'facebook_ads', label: 'Facebook Ads' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'referral', label: 'Referral' },
    { value: 'events', label: 'Events' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions: { value: LeadStatus; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
    { value: 'won', label: 'Won' },
  ];

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Text Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-filter">Email</Label>
                <Input
                  id="email-filter"
                  placeholder="Search by email..."
                  value={filters.email || ''}
                  onChange={(e) => updateFilter('email', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-filter">Company</Label>
                <Input
                  id="company-filter"
                  placeholder="Search by company..."
                  value={filters.company || ''}
                  onChange={(e) => updateFilter('company', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-filter">City</Label>
                <Input
                  id="city-filter"
                  placeholder="Search by city..."
                  value={filters.city || ''}
                  onChange={(e) => updateFilter('city', e.target.value || undefined)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={filters.status?.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('status', option.value)}
                  >
                    {option.label}
                    {filters.status?.includes(option.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <Label>Source</Label>
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={filters.source?.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('source', option.value)}
                  >
                    {option.label}
                    {filters.source?.includes(option.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Score Range */}
            <div className="space-y-2">
              <Label>Score Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Min (0-100)"
                  min="0"
                  max="100"
                  value={filters.score?.min || ''}
                  onChange={(e) => updateNestedFilter('score', 'min', parseInt(e.target.value) || undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max (0-100)"
                  min="0"
                  max="100"
                  value={filters.score?.max || ''}
                  onChange={(e) => updateNestedFilter('score', 'max', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            {/* Lead Value Range */}
            <div className="space-y-2">
              <Label>Lead Value Range ($)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Min value"
                  min="0"
                  step="0.01"
                  value={filters.lead_value?.min || ''}
                  onChange={(e) => updateNestedFilter('lead_value', 'min', parseFloat(e.target.value) || undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max value"
                  min="0"
                  step="0.01"
                  value={filters.lead_value?.max || ''}
                  onChange={(e) => updateNestedFilter('lead_value', 'max', parseFloat(e.target.value) || undefined)}
                />
              </div>
            </div>

            {/* Qualification Status */}
            <div className="space-y-2">
              <Label>Qualification Status</Label>
              <Select
                value={filters.is_qualified !== undefined ? filters.is_qualified.toString() : 'all'}
                onValueChange={(value) => updateFilter('is_qualified', value === 'all' ? undefined : value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Qualified</SelectItem>
                  <SelectItem value="false">Not Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={onApplyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={onClearFilters} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default LeadFilters;