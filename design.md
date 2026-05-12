# Skones Security Management App - Interface Design

## Overview

The Skones Security Management App is a comprehensive mobile solution for Skones Security Company Limited Ghana. It enables administrators, accounts personnel, and management to monitor deployed security guards, track performance metrics, manage payroll, and coordinate operations in real-time. The app follows Apple Human Interface Guidelines for iOS and Material Design principles for Android, ensuring a native feel across platforms.

## Design Principles

- **Mobile-First**: Optimized for portrait orientation (9:16) with one-handed usage in mind
- **Clarity**: Information hierarchy ensures critical data is immediately visible
- **Efficiency**: Minimal taps to reach core functions
- **Trust**: Professional design reflects Skones Security's corporate brand
- **Accessibility**: Large touch targets, readable fonts, sufficient color contrast

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Primary | #0a7ea4 (Teal) | Buttons, active states, highlights |
| Background | #ffffff (Light) / #151718 (Dark) | Screen backgrounds |
| Surface | #f5f5f5 (Light) / #1e2022 (Dark) | Cards, elevated surfaces |
| Foreground | #11181C (Light) / #ECEDEE (Dark) | Primary text |
| Muted | #687076 (Light) / #9BA1A6 (Dark) | Secondary text |
| Border | #E5E7EB (Light) / #334155 (Dark) | Dividers, borders |
| Success | #22C55E | Positive actions, approved status |
| Warning | #F59E0B | Caution, pending status |
| Error | #EF4444 | Errors, critical alerts |

## Screen List

### 1. Authentication & Onboarding

#### Login Screen
- Email/phone input field
- Password input field
- "Forgot Password" link
- "Login" button
- Skones Security logo and branding
- Optional: Biometric authentication toggle

#### Role Selection Screen
- Display available roles: Admin, Accounts, Operations Manager, Guard
- Role-specific permissions and features
- "Continue" button

### 2. Dashboard (Role-Based)

#### Admin Dashboard
- Welcome message with current date/time
- Quick stats cards:
  - Total Guards Deployed
  - Guards On Duty (Real-time)
  - Pending Incidents
  - Payroll Due
- Quick action buttons:
  - View All Guards
  - Create Deployment
  - View Incidents
  - Payroll Management
- Recent activity feed

#### Accounts Dashboard
- Payroll summary card
- Guards awaiting payment
- Payment status overview
- Quick action: Process Payroll

#### Operations Manager Dashboard
- Live deployment map (geo-tracking)
- Guard status indicators
- Incident alerts
- Response time metrics

### 3. Guard Management

#### Guard List Screen
- Searchable list of all guards
- Filter by: Status (On Duty, Off Duty, On Leave), Deployment Post
- Guard card showing:
  - Guard name and ID
  - Current status
  - Current deployment post
  - Merit score (visual indicator)
  - Last check-in time
- Swipe actions: View Details, Call, Message

#### Guard Detail Screen
- Guard profile information:
  - Photo
  - Full name, ID number
  - Contact information
  - Date of hire
  - Certifications
- Current deployment details
- Merit score breakdown
- Performance history (chart)
- Action buttons: Assign Post, Update Status, View Documents

### 4. Merit Scoring System

#### Merit Score Dashboard
- Overall merit score (visual gauge)
- Score breakdown by category:
  - Attendance (percentage)
  - Performance (rating)
  - Conduct (rating)
  - Training Completion (percentage)
- Recent score changes (list)
- Historical trend (line chart)

#### Merit Score Details
- Detailed breakdown of each category
- Individual incident/achievement records
- Score adjustment history with notes
- Ability to add manual adjustments (Admin only)

### 5. Deployment Posts

#### Deployment Posts List
- List of all security deployment locations
- Each post card shows:
  - Post name and location
  - Number of guards assigned
  - Current guard status
  - Post status (Active, Inactive, On Alert)
  - Last activity time
- Filter by: Status, Region

#### Deployment Post Detail
- Post information:
  - Name, address, coordinates
  - Client name and contact
  - Post requirements (number of guards, shift times)
- Assigned guards (list with status)
- Incident history at this post
- Deployment schedule
- Action buttons: Assign Guard, Update Status, View Incidents

### 6. Payroll Returns & Management

#### Payroll Dashboard
- Payroll period selector (dropdown)
- Summary cards:
  - Total Guards
  - Total Hours
  - Total Amount Due
  - Processed Payments
  - Pending Approvals
- Quick action: Generate Payroll Report

#### Payroll List
- List of guards with payroll details:
  - Guard name and ID
  - Hours worked
  - Rate per hour
  - Total amount
  - Payment status (Pending, Approved, Paid)
- Filter by: Status, Guard name
- Bulk actions: Approve All, Mark as Paid

#### Payroll Detail
- Guard information
- Detailed breakdown:
  - Days worked
  - Hours per day
  - Overtime hours
  - Deductions (if any)
  - Net amount
- Payment history
- Action buttons: Approve, Process Payment, Generate Slip

### 7. Document Printing & Reports

#### Reports Screen
- Report type selector:
  - Guard Performance Report
  - Payroll Report
  - Deployment Schedule
  - Incident Report
  - Attendance Report
- Date range selector
- Filter options (by guard, post, status)
- Preview button
- Print/Export button (PDF, Excel)

#### Document Preview
- Full-screen document preview
- Print options:
  - Print to printer
  - Save as PDF
  - Share via email
- Document header with Skones Security branding

### 8. Geo-Tracking & Live Monitoring

#### Live Map Screen
- Full-screen map showing:
  - All deployment posts (markers)
  - Guard locations (real-time, if available)
  - Guard status indicators (color-coded)
  - Route history (optional)
- Bottom sheet showing:
  - Selected guard/post details
  - Status
  - Last update time
  - Action buttons

#### Guard Location History
- Timeline view of guard movements
- Map with route overlay
- Time range selector
- Export location data

### 9. Incident Reporting

#### Incident List
- List of all incidents
- Each incident card shows:
  - Incident type
  - Location
  - Date/time
  - Severity (color-coded)
  - Status
- Filter by: Type, Status, Date Range, Location
- Search functionality

#### Incident Detail
- Incident information:
  - Type, description
  - Location, date/time
  - Guard(s) involved
  - Severity level
  - Status
- Incident timeline/updates
- Attached photos/documents
- Response actions taken
- Action buttons: Update Status, Add Note, Assign Task

#### Create/Edit Incident
- Incident type selector
- Description text area
- Location picker (map or address)
- Photo upload
- Severity selector
- Assigned guard selector
- Submit button

### 10. Radio Communication (Shortwave Simulation)

#### Radio/Communication Hub
- Contact list:
  - All staff members
  - Grouped by role/department
  - Online/offline status
- Quick message/call buttons
- Message history

#### Message/Call Interface
- Recipient information
- Message input field (for text)
- Send/Call button
- Message history (threaded)
- Timestamp and read receipts

#### Broadcast Message
- Create message to multiple recipients
- Select recipients (checkboxes)
- Message template selector (optional)
- Send to all, specific group, or custom list

### 11. Company Information

#### About Skones Screen
- Skones Security logo (large)
- Company tagline
- Founded year (1999)
- Brief company description
- Core values (displayed as cards)
- Mission statement
- "Learn More" button

#### Board of Directors
- Grid/list view of board members
- Each member card shows:
  - Photo
  - Name
  - Title
  - Brief bio
- Tap to expand for full details

#### Company History
- Timeline view of key milestones
- Founding (1999)
- Major achievements
- Growth milestones
- Industry recognition

#### Contact Information
- Headquarters address
- Phone numbers
- Email addresses
- Social media links (Facebook, Instagram, TikTok)
- WhatsApp contact
- Business hours
- "Get Directions" button (maps integration)

#### Services Overview
- Grid of service cards:
  - Security Guard Services
  - Escort & Bullion Services
  - Electronic Systems Services
  - Cash-in-Transit Services
- Each card with brief description and "Learn More" option

## Navigation Structure

### Tab Bar (Main Navigation)
1. **Dashboard** - Role-specific overview and quick actions
2. **Guards** - Guard management and monitoring
3. **Deployments** - Deployment posts and assignments
4. **Reports** - Payroll, documents, and analytics
5. **More** - Additional features (Incidents, Radio, Company Info, Settings)

### More Tab Sub-Navigation
- Incidents
- Radio/Communication
- Geo-Tracking
- Company Info
- Settings
- Help & Support
- Logout

## Key User Flows

### Flow 1: Admin Monitoring Guard Performance
1. Admin opens Dashboard
2. Taps "View All Guards"
3. Searches or filters for specific guard
4. Taps guard card to view details
5. Reviews merit score and performance history
6. Can assign new post or update status

### Flow 2: Accounts Processing Payroll
1. Accounts staff opens Dashboard
2. Taps "Payroll Management"
3. Selects payroll period
4. Reviews guard hours and amounts
5. Approves individual entries or bulk approve
6. Generates payroll report
7. Exports to PDF or Excel

### Flow 3: Operations Manager Tracking Deployment
1. Manager opens Geo-Tracking screen
2. Views live map with guard locations
3. Taps on guard marker for details
4. Can message guard or update status
5. Views incident alerts in real-time
6. Responds to incidents

### Flow 4: Incident Reporting
1. Guard or supervisor initiates incident report
2. Selects incident type and location
3. Adds description and photos
4. Assigns severity level
5. Submits report
6. Management receives notification
7. Incident tracked through resolution

## Accessibility Considerations

- Minimum font size: 16pt for body text
- Minimum touch target size: 44×44 points
- Color contrast ratio: 4.5:1 for text
- Support for system-wide text scaling
- VoiceOver/TalkBack support
- Haptic feedback for critical actions

## Performance Targets

- App launch time: < 3 seconds
- Screen transition: < 300ms
- List scrolling: 60 FPS
- Map rendering: < 1 second
- Real-time updates: < 5 second latency

## Branding Integration

- Skones Security logo on splash screen and app header
- Company colors integrated throughout
- Professional typography
- Consistent spacing and alignment
- Board of Directors photos in dedicated screen
- Company history and values prominently featured
