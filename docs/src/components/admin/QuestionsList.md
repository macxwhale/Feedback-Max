# QuestionsList.tsx

## Purpose
Displays a list of feedback questions within the admin dashboard and provides options to edit or delete them.

## Key Functionality
- Renders each question with its text, type, category, order, and help text.
- Indicates if a question is archived (inactive).
- Provides "Edit" and "Delete" buttons for each active question.
- Uses the `useToast` hook to inform the user if a question will be archived instead of permanently deleted (due to having responses).
- Disables actions for inactive questions.

## Dependencies
- lucide-react for icons
- `@/components/ui/button` for buttons
- `@/components/ui/use-toast` for displaying toasts

## Relationship to other files
Used within the questions management section of the admin dashboard (`QuestionsManagement.tsx`). Interacts with a parent component to handle edit and delete actions.

### Component Details
- Props:
  - questions: An array of question objects to display.
  - onEdit: Function to call when the edit button is clicked for a question.
  - onDelete: Function to call when the delete button is clicked for a question.
  - isDeleting: Boolean indicating if a delete operation is currently in progress.
- State: None managed within this component.
- Styling: Tailwind CSS for layout, spacing, and visual indicators.
- Accessibility: Standard HTML list structure with interactive buttons.