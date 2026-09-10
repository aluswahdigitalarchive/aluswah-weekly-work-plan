import React from 'react';
import { PresentationLayout } from '../components/presentation/PresentationLayout';

interface PresentationPageProps {
  onExit: () => void;
}

export const PresentationPage: React.FC<PresentationPageProps> = ({ onExit }) => {
  return <PresentationLayout onExit={onExit} />;
};
