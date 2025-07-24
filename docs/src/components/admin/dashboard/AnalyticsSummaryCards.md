# AnalyticsSummaryCards.tsx

## Purpose
Displays a set of summary cards highlighting key analytics metrics for an organization.

## Key Functionality
- Takes summary data as input, including total questions, total responses, and overall completion rate.
- Renders three cards: "Total Questions", "Total Responses", and "Completion Rate".
- Displays the value for each metric along with a relevant icon and color scheme.
- Includes a simulated trend indicator (hardcoded) for Total Responses and Completion Rate, with an arrow icon and colored badge.

## Dependencies
- lucide-react for icons
- `@/components/ui/card` for card layout
- `@/components/ui/badge` for trend badges

## Relationship to other files
Used within the organization admin dashboard views (e.g., `AnalyticsDashboard.tsx`, `DashboardOverviewContent.tsx`) to provide a quick, visual summary of key analytics figures.

### Component Details
- Props:
  - summary: An object containing `total_questions`, `total_responses`, and `overall_completion_rate`.
- State: None managed within this component.
- Styling: Tailwind CSS for layout, styling, and visual indicators. Uses custom background and text colors for icons.
- Accessibility: Uses semantic HTML elements and provides clear visual cues for metrics and trends.