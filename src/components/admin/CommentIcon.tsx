'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Send } from 'lucide-react';

interface CommentIconProps {
  sectionId: string;
  sectionTitle: string;
  className?: string;
}

const CommentIcon = ({ sectionId, sectionTitle, className = '' }: CommentIconProps) => {
  // Disabled old commenting system - using new Confluence-style system instead
  return null; // Return null to disable this component
};

export default CommentIcon; 