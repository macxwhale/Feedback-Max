# QuestionTypeForm.tsx

## Purpose
Renders dynamic form fields for configuring question properties based on the selected question type within the admin question form.

## Key Functionality
- Displays input fields for optional help text and placeholder text.
- Conditionally renders an options list for question types that support options (e.g., multiple choice), allowing adding, removing, and updating options.
- Conditionally renders scale configuration fields for question types that support a scale (e.g., rating), including min/max values and labels.
- Provides default options for specific question types like 'emoji'.
- Displays informative badges about the capabilities of the selected question type.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Input, Button, Label, Textarea, Card)
- `@/types/questionTypes` for type definitions

## Relationship to other files
Used within the `QuestionForm.tsx` component to handle the type-specific configuration of a question. It receives the selected question type and its capabilities as props and provides methods to update the form data in the parent component.

### Component Details
- Props:
  - questionType: The currently selected question type string.
  - supportsOptions: Boolean indicating if the type supports options.
  - supportsScale: Boolean indicating if the type supports a scale.
  - options: Array of existing options (for types that support options).
  - scaleConfig: Object containing scale configuration (for types that support scale).
  - helpText: The current help text for the question.
  - placeholderText: The current placeholder text for the question.
  - onOptionsChange: Function to call when options are updated.
  - onScaleChange: Function to call when scale configuration is updated.
  - onHelpTextChange: Function to call when help text is updated.
  - onPlaceholderChange: Function to call when placeholder text is updated.
- State: Manages the list of options locally before propagating changes up.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Uses semantic HTML elements and form controls with associated labels.