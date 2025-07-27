# Comment System Guide for Admin Users

## Overview
The new comment system allows any admin user to add feedback directly to any element on the website. It's much simpler than the previous system - you can create comments and drag them to exactly where you want them.

## How to Use

### 1. Adding Comments
- **Look for the yellow "+" button** in the bottom-right corner of any page
- **Click the button** to open the comment dialog
- **Type your feedback** in the text box (e.g., "This text is too small", "Change this color", "Add more spacing")
- **Click "Add Comment"** to create the comment

### 2. Positioning Comments
- **After creating a comment**, a yellow comment icon will appear on the page
- **Click and drag** the comment icon to any element you want to highlight
- **Drop it** on the specific text, button, or area you want to change
- The comment will stay exactly where you put it

### 3. Viewing Comments
- **Hover over any comment icon** to see the full text of your feedback
- **The tooltip shows** your comment text and when you created it
- **Comments are saved** automatically and persist between page visits

### 4. Managing Comments
- **Delete a comment** by hovering over it and clicking the red "X" button
- **Move comments** by dragging them to new positions
- **See comment count** on the "+" button (shows how many comments you have)

## Examples of Good Comments

### Text Changes
- "This heading is too small"
- "Make this text darker"
- "Add more spacing between paragraphs"
- "This font is hard to read"

### Layout Changes
- "Move this button to the right"
- "Make this section wider"
- "Add more padding around this box"
- "This spacing looks cramped"

### Content Changes
- "Add more details about pricing"
- "Include phone number here"
- "This description is too long"
- "Add a FAQ about cancellations"

### Color/Design Changes
- "This color doesn't match the brand"
- "Make this button more prominent"
- "The background is too dark"
- "Add a border around this section"

## Tips
- **Be specific** about what you want changed
- **Use clear language** so the developer understands exactly what to fix
- **One comment per issue** - don't combine multiple problems in one comment
- **Comments are page-specific** - they only appear on the page where you created them
- **Only admin users can see comments** - they're only visible when you're logged in as admin

## Admin Access
The comment system is available to any user with admin privileges. Admin status is determined by:
- Having an account in Firebase Authentication
- Having a user document in the `users` collection with `role: 'admin'`

### Setting Up Admin Users
To add a new admin user:

1. **Create the user account** in Firebase Console (Authentication → Users)
2. **Run the admin setup script**:
   ```bash
   node scripts/setup-admin.js setup your-email@example.com your-password
   ```

### Checking Admin Status
To check if a user has admin access:
```bash
node scripts/setup-admin.js check your-email@example.com
```

### Listing All Admins
To see all admin users:
```bash
node scripts/setup-admin.js list
```

## Technical Notes
- Comments are saved in your browser's local storage
- They persist between sessions but are specific to your browser
- You can have unlimited comments per page
- Comments work on all pages (home, booking, help, about, etc.)

## Troubleshooting
- **Can't see the "+" button?** Make sure you're logged in as admin
- **Comments not saving?** Check that your browser allows local storage
- **Can't drag comments?** Try clicking and holding for a moment before dragging
- **Comments disappeared?** They might have been cleared - just add new ones

This system makes it much easier for admin users to give specific, actionable feedback about exactly what needs to be changed on the website! 