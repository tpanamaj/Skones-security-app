# Skones Security Management App - TODO

## Core Infrastructure
- [x] Set up authentication system (login, role-based access)
- [x] Create role-based navigation and permissions
- [x] Set up database schema for guards, deployments, incidents, payroll
- [x] Implement local storage for offline functionality
- [x] Create API integration layer for backend communication

## Dashboard & Navigation
- [x] Build main tab bar navigation (5 tabs)
- [x] Create Admin Dashboard screen
- [x] Create Accounts Dashboard screen
- [x] Create Operations Manager Dashboard screen
- [x] Create More tab with sub-navigation
- [x] Implement quick action buttons and navigation

## Guard Management
- [x] Create Guard List screen with search and filters
- [x] Create Guard Detail screen
- [x] Build guard profile information display
- [ ] Implement guard status update functionality
- [ ] Create guard assignment to deployment posts

## Merit Scoring System
- [x] Design merit score data model
- [x] Create Merit Score Dashboard screen
- [x] Build score breakdown visualization (gauges, charts)
- [x] Implement score history tracking
- [ ] Create merit score detail screen
- [ ] Add manual score adjustment (Admin only)

## Deployment Posts Management
- [x] Create Deployment Posts List screen
- [x] Build Deployment Post Detail screen
- [ ] Implement post creation and editing
- [ ] Create guard assignment to posts
- [ ] Build post status management
- [ ] Implement deployment schedule view

## Payroll Returns & Management
- [x] Design payroll data model
- [x] Create Payroll Dashboard with summary cards
- [x] Build Payroll List screen with filters
- [x] Create Payroll Detail screen
- [x] Implement payroll calculation logic
- [x] Build payroll approval workflow
- [ ] Create payroll report generation
- [ ] Implement payment status tracking

## Document Printing & Reports
- [x] Create Reports screen with type selector
- [ ] Build report generation logic
- [ ] Implement PDF export functionality
- [ ] Create Excel export functionality
- [ ] Build document preview screen
- [ ] Implement print functionality
- [ ] Create email sharing for documents

## Geo-Tracking & Live Monitoring
- [x] Integrate map library (expo-maps or similar)
- [ ] Create Live Map screen
- [ ] Implement real-time location updates
- [ ] Build guard location markers and status indicators
- [ ] Create Guard Location History screen
- [ ] Implement route visualization
- [ ] Add location data export

## Incident Reporting
- [x] Design incident data model
- [ ] Create Incident List screen with filters
- [x] Build Incident Detail screen
- [ ] Create Create/Edit Incident screen
- [ ] Implement incident type selector
- [ ] Build photo upload for incidents
- [ ] Create incident status workflow
- [ ] Implement incident notifications

## Radio Communication (Shortwave Simulation)
- [x] Design communication data model
- [ ] Create Radio/Communication Hub screen
- [ ] Build contact list with status indicators
- [ ] Create Message/Call interface
- [ ] Implement message history
- [ ] Build broadcast message functionality
- [ ] Create group messaging
- [ ] Implement read receipts

## Company Information
- [x] Create About Skones screen
- [x] Build Board of Directors screen with photos
- [x] Create Company History timeline
- [x] Build Contact Information screen
- [x] Create Services Overview screen
- [ ] Integrate company logo and branding
- [x] Add social media links

## Branding & UI/UX
- [x] Generate custom Skones Security logo/icon
- [x] Create splash screen with Skones branding
- [x] Update app.config.ts with app name and logo
- [x] Customize color theme to match Skones brand
- [x] Implement dark mode support
- [x] Create consistent component library
- [ ] Add haptic feedback for interactions
- [ ] Implement smooth animations and transitions

## Testing & Quality Assurance
- [x] Test authentication flows
- [x] Test role-based access control
- [x] Test guard management workflows
- [x] Test payroll calculations
- [ ] Test report generation and export
- [ ] Test geo-tracking functionality
- [ ] Test incident reporting workflow
- [ ] Test communication features
- [ ] Test offline functionality
- [ ] Performance testing and optimization
- [ ] Cross-platform testing (iOS/Android/Web)

## Deployment & Documentation
- [ ] Create user documentation
- [ ] Create admin guide
- [ ] Create deployment instructions
- [ ] Set up CI/CD pipeline
- [ ] Create APK build for Android
- [ ] Create IPA build for iOS
- [ ] Deploy to app stores (if applicable)
- [ ] Create release notes
