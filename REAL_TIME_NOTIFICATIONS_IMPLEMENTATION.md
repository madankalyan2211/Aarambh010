# Real-Time Notifications Implementation

This document describes the implementation of real-time notifications for the Aarambh LMS platform.

## Overview

The real-time notification system uses WebSocket technology to provide instant updates to users when new notifications are created. This replaces the previous polling-based approach which had a 30-second refresh interval.

## Key Components

### 1. Backend Implementation

#### WebSocket Server
- Added `socket.io` to the backend server
- Created a WebSocket server that runs alongside the Express server
- Implemented user registration mechanism to map user IDs to socket connections
- Added connection/disconnection event handlers

#### Notification Utility
- Created `server/utils/notification.util.js` with functions:
  - `createNotification`: Creates a notification in the database and emits events to online recipients
  - `emitUnreadCount`: Emits updated unread notification counts to online users

#### Controller Updates
- Modified `messageController.js` to use the new notification utility
- Updated `notificationController.js` with new endpoints:
  - `markAsRead`: Marks a notification as read and emits updated counts
  - `markAllAsRead`: Marks all notifications as read and emits updated counts

#### Route Updates
- Added new routes in `notification.routes.js` for marking notifications as read

### 2. Frontend Implementation

#### API Service
- Added new functions in `api.service.ts`:
  - `markNotificationAsRead`: Marks a notification as read
  - `markAllNotificationsAsRead`: Marks all notifications as read

#### Navigation Component
- Updated `Navigation.tsx` to:
  - Establish WebSocket connections
  - Register users with the WebSocket server
  - Listen for real-time notification count updates
  - Maintain fallback polling mechanism

#### Notifications Page
- Updated `NotificationsPage.tsx` to:
  - Establish WebSocket connections
  - Listen for new notifications
  - Provide UI for marking notifications as read
  - Show real-time updates

#### App Component
- Modified `App.tsx` to pass user ID to the Navigation component

### 3. Configuration

#### Server Configuration
- Updated `server.js` to initialize and configure Socket.IO
- Added proper CORS configuration for WebSocket connections

#### Vite Configuration
- Updated `vite.config.ts` to proxy WebSocket connections
- Added `/socket.io` proxy configuration with WebSocket support

## How It Works

1. **User Connection**: When a user logs in, the frontend establishes a WebSocket connection and registers the user ID with the server.

2. **Notification Creation**: When a new notification is created (e.g., when a message is sent), the backend:
   - Saves the notification to the database
   - Checks if the recipient is online
   - If online, emits a `new-notification` event to the recipient
   - Emits an `unread-notifications-count` event with the updated count

3. **Frontend Updates**: Online recipients receive real-time updates:
   - Notification count badge updates immediately
   - New notifications can be displayed instantly (in the NotificationsPage)

4. **Fallback Mechanism**: For environments where WebSocket is not available, the polling mechanism still works as a fallback.

## Benefits

- **Instant Updates**: Users see notification count changes immediately
- **Reduced Server Load**: Eliminates the need for frequent polling
- **Better User Experience**: Provides a more responsive interface
- **Fallback Support**: Maintains compatibility with environments that don't support WebSocket

## Testing

To test the implementation:

1. Start the backend server
2. Start the frontend development server
3. Log in with two different user accounts
4. Send a message from one user to another
5. Observe that the notification count updates instantly for the recipient

## Future Improvements

- Add support for more notification types beyond messages
- Implement notification persistence and history
- Add sound notifications
- Implement notification categories and filtering