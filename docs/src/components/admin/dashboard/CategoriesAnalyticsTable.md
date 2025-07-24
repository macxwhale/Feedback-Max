# CategoriesAnalyticsTable.tsx

## Purpose
Displays analytics data organized by question categories in a sortable table format within the admin dashboard.

## Key Functionality
- Shows a table listing each category with the number of questions, total responses, and completion rate.
- Allows sorting the table by category name, number of questions, total responses, and completion rate.
- Provides an expandable row for each category to display the individual questions belonging to that category.
- Within the expanded view, shows details for each question including text, type, response count, trend, and completion rate.
- Uses icons and badges to provide visual cues for sorting direction and question trends.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Table, Badge, Button, Progress)
- `@/types/analytics` for type definitions

## Relationship to other files
Used within analytics dashboard views to provide a breakdown of performance and activity by category. It displays summarized information for each category and allows drilling down to see questions within that category.

### Component Details
- Props:
  - categories: An array of CategoryAnalytics objects to display.
- State: Manages the current `sortField` (keyof CategoryAnalytics), `sortDirection` ('asc' or 'desc'), and `expandedCategory` (string or null) using `useState`.
- Styling: Tailwind CSS for table layout, spacing, and visual indicators. Uses utility classes for text alignment and truncation.
- Accessibility: Uses semantic HTML table structure with appropriate headers and provides interactive elements for sorting and expanding rows. Includes visual indicators for sorting state and question trends.