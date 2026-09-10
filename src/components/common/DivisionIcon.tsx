import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Users,
  BookOpen,
  Building2,
  Languages,
  Camera,
  MonitorCog,
  LayoutDashboard,
  Presentation,
  Calendar,
  Layers,
  LucideProps,
} from 'lucide-react';

interface DivisionIconProps extends LucideProps {
  name: string;
}

export const DivisionIcon: React.FC<DivisionIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Users':
      return <Users {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Building2':
      return <Building2 {...props} />;
    case 'Languages':
      return <Languages {...props} />;
    case 'Camera':
      return <Camera {...props} />;
    case 'MonitorCog':
      return <MonitorCog {...props} />;
    case 'LayoutDashboard':
      return <LayoutDashboard {...props} />;
    case 'Presentation':
      return <Presentation {...props} />;
    case 'Calendar':
      return <Calendar {...props} />;
    default:
      return <Layers {...props} />;
  }
};
