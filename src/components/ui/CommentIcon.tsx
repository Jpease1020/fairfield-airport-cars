'use client';



// CommentIcon Component - BULLETPROOF TYPE SAFETY!
interface CommentIconProps {
  sectionId?: string;
  sectionTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'prominent';
}

const CommentIcon = ({ }: CommentIconProps) => {
  // Disabled old commenting system - using new Confluence-style system instead
  return null; // Return null to disable this component
};

export default CommentIcon; 