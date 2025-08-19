# MVP Backlog – Pet Care App

## Logic to Implement for settings page
- [ ] Guest Mode toggle logic (enable/disable with pop-up confirmation)
- [ ] Guest Mode modal with "Learn More" page link
- [ ] Guest access management screen (accessible without disabling Guest Mode)
- [ ] Notifications toggle logic
- [ ] Notifications menu logic (enable/disable specific notifications)
- [ ] "Turn Off All Notifications" button logic
- [ ] Data export logic (JSON without images, with spinner loader while exporting)
- [ ] Data import logic (JSON file validation + overwrite confirmation)
- [ ] Import validation for correct file type and structure
- [ ] Prevent malicious/incorrect file uploads in import
- [ ] Theme toggle persistence fix (prevent light mode flash on refresh)
- [ ] Dashboard greeting update for Guest Mode ("Welcome, Guest" instead of username)
- [ ] Redirect or role-limited UI for Guest Mode (limit what guest can do)
- [ ] Task & Pet profile sync with Firebase (CRUD operations)
- [ ] Offline support for tasks and pet profiles in PWA

## UI/UX Fixes
- [ ] Restyle file input in Import modal (better than default "Choose file / No file chosen")
- [ ] Add rename field for Export modal (filename customization)
- [ ] Add loading spinner animation for export process
- [ ] Consistent button and icon spacing in settings page
- [ ] Adjust modal styling for consistent padding/margins
- [ ] Improve notification menu layout with bell icon button + small “X enabled” text
- [ ] Ensure all switches match brand color scheme
- [ ] Prevent UI flash when switching between pages in dark mode

## Optional Enhancements (Post-MVP)
- [ ] Add search/filter for pets
- [ ] Task category tags (Feeding, Vet Visit, Grooming)
- [ ] Calendar view for upcoming tasks
- [ ] Pet gallery multi-image upload
- [ ] Export/Import with images as optional ZIP
- [ ] Guest Mode temporary access expiration
- [ ] Advanced notification scheduling


# Pets Page — Pending Backend Logic & UI/UX Improvements

## Backend Logic
- [ ] Connect Pets grid to Firestore/DB instead of hardcoded data
- [ ] Implement "Add New Pet" form submission with validation + save to DB
- [ ] Handle optional pet image upload (store in Firebase Storage or fallback to paw icon)
- [ ] Fetch and display pet profile details dynamically from DB by ID
- [ ] Implement "Recently Viewed Pets" tracking (store in DB or local storage)
- [ ] Implement "Favorites" (add/remove favorite pet state in DB)
- [ ] Add Delete Pet Profile backend logic (remove pet from DB + confirm before delete)
- [ ] Add "Add Task" flow tied to specific pet
- [ ] Persist "last viewed" pet state across sessions
- [ ] Sync pets list in real-time using Firestore listeners

## UI/UX Fixes
- [ ] Improve PetProfile page layout (cleaner header, better typography, more spacing)
- [ ] Redesign Pet card UI for better readability (image ratio, info overlay, consistent heights)
- [ ] Add hover/press animations to pet cards (smooth scaling + shadow)
- [ ] Style context menu (bulleted options, rounded corners, shadow, better spacing)
- [ ] Make "Delete Pet Profile" confirmation modal custom-styled (continue/cancel buttons, warning icon)
- [ ] Ensure icons in "Recently Viewed" remain cyan/blue in both dark & light themes (no grayscale issue)
- [ ] Add skeleton placeholders for PetProfile details (not just grid/list)
- [ ] Optimize horizontal scrolling for Recently Viewed & Favorites (smooth scroll, no bulky scrollbar)
- [ ] Ensure Add Pet FAB doesn’t overlap footer/nav on mobile
- [ ] Improve responsive grid layout (consistent across small, medium, large screens)
- [ ] Prevent accidental text/image highlight across UI

# AddPet Page - MVP Roadmap

## Logic to Implement for AddPet Page
- [ ] **Save Pet**: store new pet data in Firestore (name, age, description, gender, image URL).  
- [ ] **Validate Name**: show error if name field is empty.  
- [ ] **Upload Image**: allow selecting from gallery and upload to Firebase Storage.  
- [ ] **Redirect on Save**: navigate back to `/pets` after successful save.  
- [ ] **Optional Fields**: age, description, and gender should save if provided.  
- [ ] **Additional Info Section**: store user notes (allergies, special care).  

## Style / UI Improvements
- [ ] Refine light theme layout for better spacing and readability.  
- [ ] Standardize outline styling for all input fields.  
- [ ] Improve Save Pet button styling: outline only, smaller size, consistent color.  
- [ ] Responsive layout fixes for mobile and desktop.  
- [ ] Future: add smooth transitions / focus states / accessible ARIA labels.  

## Advanced / Future Features
- [ ] Breed selection (dropdown/typeahead) with “unsure” option.  
- [ ] AI-based pet breed scan (later version).  
- [ ] Multi-image support and drag-and-drop uploads.  
- [ ] Enhanced glass / transparent container effects.  


# AddTask Page - Pending Backend Logic

The `AddTask` page is currently front-end only.  

## Implemented
- Styled form with fields: Task Title, Description, Pet Selection (with Select All), Type, Priority, Reminder.
- Dynamic placeholder text suggestions generated from pets owned by the user.
- Modal and dropdowns use custom app styles (no default browser styles).
- Save Task button includes a 2s loading animation before completing.
- Cancel button navigates back without saving.

## Pending (Backend)
- **Firestore Integration:** 
  - Save tasks to `tasks` collection in Firestore.
  - Include fields: `title`, `description`, `assignedPets[]`, `priority`, `type`, `reminderTime`, `createdAt`, `completed`.
- **User Data Context:** 
  - Fetch pet list dynamically from user’s Firestore document.
  - Ensure “Select All” dynamically selects all current pets.
- **Notifications:** 
  - Hook reminder times into Firebase Cloud Messaging (or a scheduling logic) for push/local notifications.
- **Sync:** 
  - Multi-device sync of tasks via Firestore realtime updates.
- **Validation:** 
  - Ensure required fields (title, description, pets) are validated before saving.

---

⚠️ **Reminder:** Backend wiring will come later once Firebase setup is complete. For now, this page is *UI only*.
