# AnalyticsTable.tsx

## Purpose
Displays detailed analytics data in a table format, showing insights per question and per category.

## Key Functionality
- Presents data in two tabs: "Questions" and "Categories".
- For questions, it shows text, type, category, response count, completion rate, trend analysis (with icon and label), and key insights.
- For categories, it shows the category name, total questions, total responses, and completion rate.
- Includes a "Drill Down" option for questions (when `showDrillDown` is true) to reveal more detailed information like response insights and distribution using the `QuestionDrillDown` component.
- Uses icons and colored badges to visually represent trends.
- Displays fallback messages when no questions or categories are found.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Card, Badge, Button, Tabs, Table)
- `./QuestionDrillDown`
- `@/types/analytics` for type definitions

## Relationship to other files
Used within the organization admin dashboard views (e.g., `AdvancedDashboardView.tsx`, `DashboardOverviewContent.tsx`) to provide detailed tabular analytics. It utilizes the `QuestionDrillDown` component for displaying expanded question details.

### Component Details
- Props:
  - questions: An array of QuestionAnalytics objects.
  - categories: An array of CategoryAnalytics objects.
  - summary: An object containing overall summary statistics.
  - showDrillDown: Optional boolean to enable the question drill-down feature.
- State: Manages the `selectedQuestion` ID for the drill-down feature using `useState`.
- Styling: Tailwind CSS for layout, styling, and visual indicators. Uses utility classes for truncation and responsiveness.
- Accessibility: Uses semantic HTML table structure with appropriate headers and provides interactive elements for drill-down. Includes informative messages for empty states.