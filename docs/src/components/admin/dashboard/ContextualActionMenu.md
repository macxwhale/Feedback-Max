# ContextualActionMenu.tsx

## Purpose
Provides a reusable dropdown menu component for displaying contextual actions related to specific elements or sections in the dashboard.

## Key Functionality
- Renders a trigger button (defaulting to a vertical ellipsis icon) that opens a dropdown menu on click.
- Displays a list of actions within the dropdown, each with an icon, label, and optional shortcut or badge.
- Supports defining action variants (e.g., destructive) to influence styling.
- Allows for separators to group actions within the menu.
- Provides pre-configured action sets for common use cases like metric actions and dashboard actions.
- Manages the open/closed state of the dropdown menu.

## Dependencies
- lucide-react for icons
- `@/components/ui/dropdown-menu` for dropdown functionality and styling
- `@/components/ui/button` for the trigger button
- `@/components/ui/badge` for displaying badges on actions
- `@/lib/utils` for the `cn` utility

## Relationship to other files
Used throughout the dashboard to provide consistent and contextual action menus for various components (e.g., tables, cards, metrics). It receives the list of available actions as a prop and handles their display and execution.

### Component Details
- Props:
  - actions: An array of `ContextualAction` objects defining the menu items.
  - title: Optional title for the dropdown menu.
  - className: Optional additional CSS classes for the trigger button.
  - buttonVariant: Optional variant for the trigger button.
  - buttonSize: Optional size for the trigger button.
- State: Manages the open/closed state of the dropdown using the `DropdownMenu` component's internal state.
- Styling: Tailwind CSS for layout and styling, with specific classes for action variants and visual elements like shortcuts.
- Accessibility: Uses WAI-ARIA attributes provided by the dropdown menu component for accessibility. The trigger button has an `sr-only` span for screen readers.