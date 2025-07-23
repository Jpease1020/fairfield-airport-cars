'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, X, HelpCircle } from 'lucide-react';

interface TestCommentWidgetProps {
  isAdmin?: boolean;
  commentMode?: boolean;
  onToggleCommentMode?: () => void;
}

const TestCommentWidget = ({ 
  isAdmin = false, 
  commentMode = false, 
  onToggleCommentMode 
}: TestCommentWidgetProps) => {
  // Disabled old commenting widget - using new Confluence-style system instead
  return null; // Return null to disable this component
};

export default TestCommentWidget; 