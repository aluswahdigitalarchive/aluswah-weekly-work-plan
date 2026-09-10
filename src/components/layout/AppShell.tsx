import React, { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AgendaFormModal } from '../admin/AgendaFormModal';
import { PriorityManagerModal } from '../admin/PriorityManagerModal';
import { WeeklyPlanModal } from '../admin/WeeklyPlanModal';
import { useAgenda } from '../../context/AgendaContext';

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { isWeeklyPlanModalOpen, closeWeeklyPlanModal } = useAgenda();

  const handleEnterPresentation = () => {
    onNavigate('/presentation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Sticky Topbar */}
      <Topbar
        onOpenMobileMenu={() => setMobileNavOpen(true)}
        onEnterPresentation={handleEnterPresentation}
        onNavigate={onNavigate}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
        </div>

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          currentPath={currentPath}
          onNavigate={onNavigate}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Global Add & Edit Agenda Modal Dialog */}
      <AgendaFormModal />
      {/* Global Priority Manager Modal */}
      <PriorityManagerModal />
      {/* Global Weekly Plan Modal */}
      <WeeklyPlanModal
        isOpen={isWeeklyPlanModalOpen}
        onClose={closeWeeklyPlanModal}
      />
    </div>
  );
};
