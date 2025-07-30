'use client';



interface TestCommentWidgetProps {
  isAdmin?: boolean;
  commentMode?: boolean;
  onToggleCommentMode?: () => void;
}

const TestCommentWidget = ({ }: TestCommentWidgetProps) => {
  // Disabled old commenting widget - using new Confluence-style system instead
  return null; // Return null to disable this component
};

export default TestCommentWidget; 