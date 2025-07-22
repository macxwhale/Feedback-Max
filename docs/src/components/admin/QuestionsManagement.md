# QuestionsManagement.tsx

## Purpose
Provides a complete interface for managing feedback questions within the admin dashboard, including creating, editing, and deleting questions.

## Key Functionality
- Fetches the list of questions, available question types, and categories using `react-query`.
- Manages the state for the question form, including form data and whether a question is being edited.
- Handles the submission of the question form, triggering either a create or update mutation based on the `editingId` state.
- Implements delete functionality for questions using a mutation.
- Uses `useToast` to provide user feedback on successful operations and errors.
- Renders the `QuestionForm` for adding/editing questions and `QuestionsList` to display existing questions.
- Calculates the order index for new questions.

## Dependencies
- `@tanstack/react-query` for data fetching and mutations
- `@/services/questionsService` for interacting with the questions API
- `@/components/ui/card` for card layout
- `./QuestionForm`
- `./QuestionsList`
- `@/components/ui/use-toast` for displaying toasts
- `@/types/questionTypes` for type definitions

## Relationship to other files
Used as a tab content within the organization admin dashboard (`OrganizationAdminDashboard.tsx`). It orchestrates the interaction between `QuestionForm` and `QuestionsList` and communicates with the `questionsService` for data operations.

### Component Details
- Props: None.
- State: Manages `editingId` (string or null) and `formData` (QuestionFormData object) using `useState`. Manages data fetching and mutation states using `react-query`.
- Styling: Tailwind CSS for layout and spacing.
- Accessibility: Combines accessible child components (`QuestionForm`, `QuestionsList`).