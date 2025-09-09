import React from 'react';
import { IconProps as PhosphorIconProps } from 'phosphor-react';
import { cn } from '../../utils/cn';

// Re-export common Phosphor icons for easy importing
export {
  CalendarBlank,
  Clock,
  User,
  Users,
  BookOpen,
  Brain,
  FileText,
  Link,
  DotsThreeOutline,
  Chat,
  CaretDown,
  ArrowSquareOut,
  Play,
  VideoCamera,
  Clipboard,
  Question,
  GraduationCap,
  Lightbulb,
  Target,
  ChartBar,
  Bell,
  Gear,
  SignOut,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  MagnifyingGlass,
  Download,
  Upload,
  Star,
  Heart,
  Share,
  Copy,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  Warning,
  Info,
  CheckCircle,
  XCircle,
  Sparkle,
  Compass,
  TextBolder as Bold,
  TextItalic as Italic,
  TextUnderline as Underline,
  TextStrikethrough as Strikethrough,
  CodeSimple as Code,
  Palette,
  PaintBrush as Highlighter,
  Image,
  ListBullets,
  ListNumbers,
  TextH,
  TextHOne,
  TextHTwo,
  TextHThree
} from 'phosphor-react';

// Additional icons used in editor toolbar
export { TextT } from 'phosphor-react';

// Extended icon props with our design system integration
export interface IconProps extends Omit<PhosphorIconProps, 'size' | 'weight'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  variant?: 'default' | 'brand' | 'muted' | 'success' | 'warning' | 'error';
}

// Size mapping for consistent icon sizing
const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

// Color variants that work with our brand system
const variantStyles = {
  default: 'text-gray-600',
  brand: 'text-brand-primary',
  muted: 'text-gray-400',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

// Icon wrapper component for consistent styling
export const Icon: React.FC<IconProps & { icon: React.ComponentType<PhosphorIconProps> }> = ({
  icon: IconComponent,
  size = 'md',
  weight = 'regular',
  variant = 'default',
  className,
  ...props
}) => {
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  
  return (
    <IconComponent
      size={iconSize}
      weight={weight}
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  );
};

// Utility component for quick icon usage
export const BrandIcon: React.FC<IconProps & { icon: React.ComponentType<PhosphorIconProps> }> = (props) => (
  <Icon {...props} variant="brand" />
);
