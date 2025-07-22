# QuestionForm.tsx

## Purpose
Provides a form for creating or editing feedback questions within the admin dashboard.

## Key Functionality
- Allows input for the question text.
- Provides selection for the question type and category.
- Dynamically renders additional configuration fields based on the selected question type using `QuestionTypeForm`.
- Manages form data state and updates it based on user input.
- Includes buttons for submitting the form (add or update question) and canceling an edit operation.
- Disables submission if the question text is empty or the form is submitting.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Button, Input, Select)
- `./QuestionTypeForm`
- `@/types/questionTypes` for type definitions and utility functions

## Relationship to other files
Used within the questions management section of the admin dashboard. It relies on `QuestionTypeForm` to handle type-specific inputs and interacts with a parent component to handle form submission and cancellation.

### Component Details
- Props:
  - formData: The current state of the form data.
  - setFormData: Function to update the form data state.
  - questionTypes: Array of available question types.
  - categories: Array of available categories.
  - editingId: ID of the question being edited, or null if creating a new question.
  - onSubmit: Function to call when the form is submitted.
  - onCancel: Function to call when the edit operation is cancelled.
  - isSubmitting: Boolean indicating if the form is currently submitting.
- State: Manages form data using local state (passed down via props).
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Uses semantic HTML elements and form controls with associated labels.