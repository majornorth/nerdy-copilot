import React from 'react';
import { 
  Brain, 
  FileText, 
  Clock, 
  User, 
  BookOpen, 
  VideoCamera,
  ChatCircle,
  Bell,
  Star,
  Heart,
  CheckCircle,
  Warning,
  Info,
  Target,
  Lightbulb
} from 'phosphor-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { Icon, BrandIcon } from '../ui/Icon';

export const IconShowcase: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Phosphor Icons Showcase</h2>
        
        {/* Icon Weights Demo */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon Weights</h3>
          <div className="grid grid-cols-5 gap-6">
            <div className="text-center">
              <Brain size={32} weight="thin" className="text-brand-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Thin</p>
            </div>
            <div className="text-center">
              <Brain size={32} weight="light" className="text-brand-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Light</p>
            </div>
            <div className="text-center">
              <Brain size={32} weight="regular" className="text-brand-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Regular</p>
            </div>
            <div className="text-center">
              <Brain size={32} weight="bold" className="text-brand-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Bold</p>
            </div>
            <div className="text-center">
              <Brain size={32} weight="fill" className="text-brand-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Fill</p>
            </div>
          </div>
        </Card>

        {/* Icon Sizes Demo */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon Sizes</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Icon icon={FileText} size="xs" variant="brand" />
              <p className="text-sm text-gray-600 mt-2">XS (12px)</p>
            </div>
            <div className="text-center">
              <Icon icon={FileText} size="sm" variant="brand" />
              <p className="text-sm text-gray-600 mt-2">SM (16px)</p>
            </div>
            <div className="text-center">
              <Icon icon={FileText} size="md" variant="brand" />
              <p className="text-sm text-gray-600 mt-2">MD (20px)</p>
            </div>
            <div className="text-center">
              <Icon icon={FileText} size="lg" variant="brand" />
              <p className="text-sm text-gray-600 mt-2">LG (24px)</p>
            </div>
            <div className="text-center">
              <Icon icon={FileText} size="xl" variant="brand" />
              <p className="text-sm text-gray-600 mt-2">XL (32px)</p>
            </div>
          </div>
        </Card>

        {/* Icon Variants Demo */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon Color Variants</h3>
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center">
              <Icon icon={CheckCircle} size="lg" variant="default" />
              <p className="text-sm text-gray-600 mt-2">Default</p>
            </div>
            <div className="text-center">
              <Icon icon={CheckCircle} size="lg" variant="brand" />
              <p className="text-sm text-gray-600 mt-2">Brand</p>
            </div>
            <div className="text-center">
              <Icon icon={CheckCircle} size="lg" variant="success" />
              <p className="text-sm text-gray-600 mt-2">Success</p>
            </div>
            <div className="text-center">
              <Icon icon={Warning} size="lg" variant="warning" />
              <p className="text-sm text-gray-600 mt-2">Warning</p>
            </div>
            <div className="text-center">
              <Icon icon={Warning} size="lg" variant="error" />
              <p className="text-sm text-gray-600 mt-2">Error</p>
            </div>
            <div className="text-center">
              <Icon icon={Info} size="lg" variant="muted" />
              <p className="text-sm text-gray-600 mt-2">Muted</p>
            </div>
          </div>
        </Card>

        {/* Buttons with Icons */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Buttons with Icons</h3>
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={VideoCamera} iconWeight="regular">
              Join Meeting
            </Button>
            <Button variant="outline" leftIcon={FileText} iconWeight="regular">
              View Document
            </Button>
            <Button variant="ghost" rightIcon={Clock} iconWeight="light">
              Schedule Later
            </Button>
            <Button variant="secondary" leftIcon={User} rightIcon={ChatCircle} iconWeight="regular">
              Contact Student
            </Button>
          </div>
        </Card>

        {/* Form Inputs with Icons */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Inputs with Icons</h3>
          <div className="space-y-4 max-w-md">
            <FormInput 
              label="Search"
              placeholder="Search lessons..."
              leftIcon={Target}
              iconWeight="regular"
            />
            <FormInput 
              label="Email"
              placeholder="Enter your email"
              leftIcon={User}
              iconWeight="light"
            />
            <FormInput 
              label="Notification Settings"
              placeholder="Configure alerts"
              rightIcon={Bell}
              iconWeight="regular"
            />
          </div>
        </Card>

        {/* Educational Icons Grid */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational & Tutoring Icons</h3>
          <div className="grid grid-cols-8 gap-6">
            {[
              { icon: Brain, label: 'Brain' },
              { icon: BookOpen, label: 'Book' },
              { icon: FileText, label: 'Document' },
              { icon: VideoCamera, label: 'Video' },
              { icon: Clock, label: 'Time' },
              { icon: User, label: 'Student' },
              { icon: ChatCircle, label: 'Chat' },
              { icon: Bell, label: 'Notification' },
              { icon: Star, label: 'Rating' },
              { icon: Heart, label: 'Favorite' },
              { icon: CheckCircle, label: 'Complete' },
              { icon: Target, label: 'Goal' },
              { icon: Lightbulb, label: 'Idea' },
              { icon: Warning, label: 'Alert' },
              { icon: Info, label: 'Info' }
            ].map(({ icon, label }) => (
              <div key={label} className="text-center">
                <BrandIcon icon={icon} size="lg" weight="regular" className="mx-auto mb-2" />
                <p className="text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};