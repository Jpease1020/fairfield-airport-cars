# Design Feedback System - Technical Writeup

## **Overview**
A section-based comment system that allows designers to toggle comment mode, click on page sections to add feedback, and automatically create JIRA tickets. Built for rapid prototyping with localStorage persistence.

## **Core Architecture**

### **1. Context Provider (`CommentProvider`)**
```typescript
interface CommentContextType {
  isCommentMode: boolean;
  toggleCommentMode: () => void;
  comments: SectionComment[];
  commentCount: number;
  createComment: (data: { sectionId: string; sectionName: string; commentText: string; jiraTicket?: string; figmaLink?: string }) => Promise<void>;
  refreshComments: () => Promise<void>;
  activeSection: { sectionId: string; sectionName: string } | null;
  setActiveSection: (section: { sectionId: string; sectionName: string } | null) => void;
}
```

### **2. Data Structure**
```typescript
interface SectionComment {
  id: number;
  page_url: string;
  section_id: string;
  section_name: string;
  comment_text: string;
  jira_ticket_id?: string;
  figma_link?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## **Key Components**

### **1. CommentToggle**
- Floating button that enables/displays comment mode
- Shows total comment count
- Toggle between "Show Comments" and "Hide Comments"

### **2. CommentableSection**
- Wraps any page section to make it commentable
- Adds dashed borders and hover effects when comment mode is active
- Displays comment count icon if comments exist
- Handles click events to open comment modal

### **3. CommentModal**
- Modal for adding new comments
- Fields: comment text, JIRA ticket ID (optional), Figma link (optional)
- Auto-creates JIRA ticket if none provided
- Saves to localStorage for fast testing

## **Implementation Flow**

### **1. Setup**
```typescript
// Wrap your app with CommentProvider
<CommentProvider>
  <YourApp />
</CommentProvider>

// Wrap page sections
<CommentableSection 
  sectionId="hero" 
  sectionName="Hero Carousel"
  isCommentMode={isCommentMode}
  onSectionClick={setActiveSection}
  commentCount={getCommentCount('hero')}
>
  <YourSectionContent />
</CommentableSection>
```

### **2. User Flow**
1. User clicks "Show Comments" toggle
2. Page sections get dashed borders and become clickable
3. User clicks on a section → opens comment modal
4. User fills out comment form → saves to localStorage
5. Comment icon appears on section with count
6. JIRA ticket auto-created (if no ticket ID provided)

### **3. Data Persistence**
- **Fast Testing**: Uses `localStorage` with key `'section_comments'`
- **Production**: Replace with API calls to your backend
- **JIRA Integration**: Mock functions that log actions and return fake ticket IDs

## **API Structure**

### **Backend Endpoints**
```javascript
POST /api/comments - Create comment
GET /api/comments - Get all comments for page
PUT /api/comments/:id - Update comment
DELETE /api/comments/:id - Delete comment
```

### **JIRA Integration**
```javascript
// Mock functions for testing
createJiraTicket(ticketData) → returns mock ticket key
updateJiraTicket(ticketKey, updates) → logs updates
getJiraTicketStatus(ticketKey) → returns mock status
```

## **Styling Approach**

### **Styled Components**
- Modal overlay with backdrop blur
- Floating toggle button with position: fixed
- Section wrappers with conditional borders
- Comment icons with count badges

### **Theme Integration**
- Uses existing design system colors
- Responsive design for mobile/desktop
- Consistent with existing UI patterns

## **Performance Considerations**

### **Optimizations**
- Throttled mouse events for hover effects
- Memoized comment counts
- Lazy loading of comment data
- Virtual scrolling for large comment lists (future)

### **State Management**
- Context provider for global state
- Local state for modal forms
- localStorage for persistence
- Router integration for page-specific comments

## **Extension Points**

### **Future Enhancements**
- Real-time sync with WebSockets
- Drag-and-drop positioning
- Screenshot capture
- User authentication
- Comment threading
- Export to design tools

### **Integration Options**
- Replace localStorage with your database
- Connect to real JIRA API
- Add authentication middleware
- Integrate with your design system

## **File Structure**
```
components/reusable/
├── CommentToggle/
├── CommentModal/
└── CommentableSection/

context-providers/
└── comment-provider.tsx

lib/
└── api-comments.ts

server/
├── controllers/
│   ├── comments.js
│   └── jira.js
└── routes/
    └── comments.js
```

## **Quick Start**
1. Copy the context provider and components
2. Wrap your app with `CommentProvider`
3. Wrap sections with `CommentableSection`
4. Add `CommentToggle` and `CommentModal` to your layout
5. Replace localStorage calls with your API
6. Connect to real JIRA API

The system is designed to be **modular and extensible** - you can start with the basic functionality and add features incrementally.

## **Priority Level**
- **High Priority** - Essential for design collaboration
- **Estimated Effort** - 2-3 weeks for full implementation
- **Dependencies** - None (can be implemented independently)

## **Success Metrics**
- Reduced design feedback cycle time
- Increased collaboration between designers and developers
- Improved tracking of design changes
- Better integration with project management tools

## **Technical Requirements**
- React Context API for state management
- TypeScript for type safety
- Styled Components for styling
- localStorage for initial persistence
- JIRA API integration (future)
- WebSocket support for real-time updates (future) 