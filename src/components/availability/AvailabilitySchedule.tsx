import React from 'react';
import { ArrowSquareOut, Clock } from 'phosphor-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { mockAvailability } from '../../data/mockData';

export const AvailabilitySchedule: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={20} weight="regular" className="text-brand-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
        </div>
        <a href="#" className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover transition-colors">
          Peak hours
          <ArrowSquareOut size={20} weight="regular" />
        </a>
      </div>
      
      <Card>
        <div className="space-y-4">
          {mockAvailability.map((slot) => (
            <div key={slot.day} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 w-8">{slot.day}</span>
              <span className="text-sm text-gray-600">{slot.timeRange}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            Update your availability
          </Button>
        </div>
      </Card>
    </div>
  );
};