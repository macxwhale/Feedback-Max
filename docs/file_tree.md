```
.
├── BEST_PRACTICES.md
├── CODEBASE_REVIEW.md
├── CODEBASE_REVIEW_COMPREHENSIVE.md
├── IMPLEMENTATION_PROGRESS.md
├── PHASE_2_ARCHITECTURE.md
├── PHASE_3_PERFORMANCE.md
├── PHASE_4_DEVELOPER_EXPERIENCE.md
├── README.md
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── docs
│   ├── DEVELOPER_GUIDE.md
│   ├── api
│   │   └── README.md
│   └── components
│       └── README.md
├── public
│   ├── favicon.ico
│   ├── placeholder.svg
│   ├── robots.txt
│   └── lovable-uploads
│       ├── 367347fe-02da-4338-b8ba-91138293d303.png
│       └── b7887345-a0fe-4dd7-ab2b-4015ed4211e8.png
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── application
│   │   └── services
│   │       └── UserInvitationApplicationService.ts
│   ├── components
│   │   ├── FeedbackForm.tsx
│   │   ├── ThankYouModal.tsx
│   │   ├── ThemeManager.tsx
│   │   ├── admin
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminStats.tsx
│   │   │   ├── AdminTabs.tsx
│   │   │   ├── CreateOrganizationModal.tsx
│   │   │   ├── EditOrganizationModal.tsx
│   │   │   ├── EnhancedInviteUserModal.tsx
│   │   │   ├── EnhancedMembersList.tsx
│   │   │   ├── EnhancedRoleBadge.tsx
│   │   │   ├── EnhancedRoleSelector.tsx
│   │   │   ├── EnhancedUserManagement.tsx
│   │   │   ├── FormConfig.tsx
│   │   │   ├── MemberStats.tsx
│   │   │   ├── OrganizationAdminDashboard.tsx
│   │   │   ├── OrganizationCard.tsx
│   │   │   ├── OrganizationHeader.tsx
│   │   │   ├── OrganizationOverviewStats.tsx
│   │   │   ├── OrganizationSettingsTab.tsx
│   │   │   ├── OrganizationSpecificStats.tsx
│   │   │   ├── OrganizationStats.tsx
│   │   │   ├── OrganizationsList.tsx
│   │   │   ├── PendingInvitations.tsx
│   │   │   ├── QuestionForm.tsx
│   │   │   ├── QuestionTypeForm.tsx
│   │   │   ├── QuestionsList.tsx
│   │   │   ├── QuestionsManagement.tsx
│   │   │   ├── RecentActivityCard.tsx
│   │   │   ├── RoleBadge.tsx
│   │   │   ├── SimpleUserManagementHeader.tsx
│   │   │   ├── UserAvatar.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── UserManagementTabs.tsx
│   │   │   ├── WebhookSettings.tsx
│   │   │   ├── ai
│   │   │   │   └── ConversationalAnalytics.tsx
│   │   │   ├── dashboard
│   │   │   │   ├── AdvancedDashboardView.tsx
│   │   │   │   ├── AnalyticsDashboard.tsx
│   │   │   │   ├── AnalyticsInsights.tsx
│   │   │   │   ├── AnalyticsSummaryCards.tsx
│   │   │   │   ├── AnalyticsTable.tsx
│   │   │   │   ├── CategoriesAnalyticsTable.tsx
│   │   │   │   ├── ContextualActionMenu.tsx
│   │   │   │   ├── CustomerInsightsDashboard.tsx
│   │   │   │   ├── DashboardBreadcrumb.tsx
│   │   │   │   ├── DashboardCharts.tsx
│   │   │   │   ├── DashboardCustomization.tsx
│   │   │   │   ├── DashboardDataProvider.tsx
│   │   │   │   ├── DashboardErrorBoundary.tsx
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardLazyComponents.tsx
│   │   │   │   ├── DashboardNavigation.tsx
│   │   │   │   ├── DashboardOverview.tsx
│   │   │   │   ├── DashboardOverviewContent.tsx
│   │   │   │   ├── DashboardQuickActions.tsx
│   │   │   │   ├── DashboardSearch.tsx
│   │   │   │   ├── DashboardSidebar.tsx
│   │   │   │   ├── DashboardSidebarQuickStats.tsx
│   │   │   │   ├── DashboardStatsGrid.tsx
│   │   │   │   ├── DashboardTabSections.tsx
│   │   │   │   ├── DashboardTabs.tsx
│   │   │   │   ├── DashboardTabsDevPanel.tsx
│   │   │   │   ├── DashboardUserMenu.tsx
│   │   │   │   ├── DataExportDialog.tsx
│   │   │   │   ├── DataSummaryBar.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── EnhancedDashboardLayout.tsx
│   │   │   │   ├── EnhancedFeedbackAnalytics.tsx
│   │   │   │   ├── EnhancedLoadingSpinner.tsx
│   │   │   │   ├── EnhancedMetricCard.tsx
│   │   │   │   ├── EnhancedNavigationBreadcrumb.tsx
│   │   │   │   ├── ExecutiveDashboard.tsx
│   │   │   │   ├── ExecutiveSummaryDashboard.tsx
│   │   │   │   ├── InformationRichDashboard.tsx
│   │   │   │   ├── LiveActivityFeed.tsx
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   ├── MobileDashboard.tsx
│   │   │   │   ├── NotificationCenter.tsx
│   │   │   │   ├── NotificationDropdown.tsx
│   │   │   │   ├── OperationalAnalytics.tsx
│   │   │   │   ├── OptimizedDashboard.tsx
│   │   │   │   ├── PaginationControls.tsx
│   │   │   │   ├── PerformanceAnalyticsDashboard.tsx
│   │   │   │   ├── QuestionAnalysisUtils.ts
│   │   │   │   ├── QuestionDrillDown.tsx
│   │   │   │   ├── QuestionsAnalyticsTable.tsx
│   │   │   │   ├── QuickActionPanel.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   ├── RealTimeAnalytics.tsx
│   │   │   │   ├── RecentActivity.tsx
│   │   │   │   ├── RefactoredExecutiveDashboard.tsx
│   │   │   │   ├── ResponsesAnalyticsTable.tsx
│   │   │   │   ├── SearchAndFilters.tsx
│   │   │   │   ├── SectionLabel.tsx
│   │   │   │   ├── SentimentAnalyticsDashboard.tsx
│   │   │   │   ├── SmartQuickActions.tsx
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   └── UpgradePrompt.tsx
│   │   │   ├── inbox
│   │   │   │   ├── EnhancedFeedbackInbox.tsx
│   │   │   │   └── FeedbackInbox.tsx
│   │   │   ├── integration
│   │   │   │   └── CRMIntegration.tsx
│   │   │   ├── integrations
│   │   │   │   ├── ApiManagement.tsx
│   │   │   │   └── SmsIntegrations.tsx
│   │   │   ├── performance
│   │   │   │   ├── PerformanceDashboard.tsx
│   │   │   │   └── SystemPerformanceConsole.tsx
│   │   │   ├── system
│   │   │   │   ├── AssignUserToOrgModal.tsx
│   │   │   │   ├── FlaskWrapperSettings.tsx
│   │   │   │   ├── SystemInvitationsTable.tsx
│   │   │   │   ├── SystemUserManagement.tsx
│   │   │   │   └── SystemUsersTable.tsx
│   │   │   └── user-management
│   │   │       ├── UserManagementHeader.tsx
│   │   │       ├── UserManagementStats.tsx
│   │   │       └── UsersList.tsx
│   │   ├── auth
│   │   │   ├── AccessDeniedPage.tsx
│   │   │   ├── AdminLoginPage.tsx
│   │   │   ├── AuthErrorBoundary.tsx
│   │   │   ├── AuthWrapper.tsx
│   │   │   ├── AuthenticationRequired.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── OrganizationAdminRequired.tsx
│   │   │   ├── PermissionGuard.tsx
│   │   │   ├── PermissionRequired.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RoleBasedAccess.tsx
│   │   │   └── SystemAdminRequired.tsx
│   │   ├── common
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── __tests__
│   │   │       └── ErrorBoundary.test.tsx
│   │   ├── dashboard
│   │   │   └── StatsGrid.tsx
│   │   ├── feedback
│   │   │   ├── AdvancedInsightsDashboard.tsx
│   │   │   ├── AnalyticsInsights.tsx
│   │   │   ├── AnimatedButton.tsx
│   │   │   ├── AnimatedQuestionCard.tsx
│   │   │   ├── BrandedButton.tsx
│   │   │   ├── BrandedHeader.tsx
│   │   │   ├── BreadcrumbNavigation.tsx
│   │   │   ├── CategoryScoreDisplay.tsx
│   │   │   ├── CompactProgressBar.tsx
│   │   │   ├── CustomerInsightsDashboard.tsx
│   │   │   ├── DataUsageInfo.tsx
│   │   │   ├── EmojiRating.tsx
│   │   │   ├── EnhancedLoading.tsx
│   │   │   ├── EnhancedProgressBar.tsx
│   │   │   ├── EnhancedQuestionRenderer.tsx
│   │   │   ├── EnhancedSlider.tsx
│   │   │   ├── EnhancedThankYouModal.tsx
│   │   │   ├── FeedbackContainer.tsx
│   │   │   ├── FeedbackContent.tsx
│   │   │   ├── FeedbackErrorBoundary.tsx
│   │   │   ├── FeedbackHeader.tsx
│   │   │   ├── FeedbackModals.tsx
│   │   │   ├── KeyboardNavigation.tsx
│   │   │   ├── LikertScale.tsx
│   │   │   ├── MatrixQuestion.tsx
│   │   │   ├── MobileNavigationButtons.tsx
│   │   │   ├── MobileProgressBar.tsx
│   │   │   ├── MobileQuestionCard.tsx
│   │   │   ├── MotivationalProgress.tsx
│   │   │   ├── MultipleChoice.tsx
│   │   │   ├── NPSRating.tsx
│   │   │   ├── NavigationButtons.tsx
│   │   │   ├── OpenText.tsx
│   │   │   ├── OrganizationHeader.tsx
│   │   │   ├── PrivacyNotice.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── QuestionRenderer.tsx
│   │   │   ├── QuestionScores.tsx
│   │   │   ├── RankingQuestion.tsx
│   │   │   ├── ResponsiveContainer.tsx
│   │   │   ├── SaveContinueOptions.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   ├── SentimentTrends.tsx
│   │   │   ├── SimpleThankYouModal.tsx
│   │   │   ├── SmartSuggestions.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── SuccessAnimation.tsx
│   │   │   ├── ThankYouActions.tsx
│   │   │   ├── TotalScore.tsx
│   │   │   ├── TouchOptimizedInput.tsx
│   │   │   └── WelcomeScreen.tsx
│   │   ├── landing
│   │   │   ├── DashboardPreview.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── FinalCTA.tsx
│   │   │   ├── FloatingMetrics.tsx
│   │   │   ├── FluidBackground.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── ModernHeader.tsx
│   │   │   ├── ModernHero.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── SocialProof.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── TrustBadges.tsx
│   │   ├── navigation
│   │   │   └── BottomNavigation.tsx
│   │   ├── org
│   │   │   └── CreateOrganizationPage.tsx
│   │   ├── performance
│   │   │   └── PerformanceMonitor.tsx
│   │   └── ui
│   │       ├── accessibility-wrapper.tsx
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── date-picker.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── enhanced-button.tsx
│   │       ├── enhanced-card.tsx
│   │       ├── enhanced-loading.tsx
│   │       ├── enhanced-table.tsx
│   │       ├── error-fallback.tsx
│   │       ├── floating-action-button.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── menubar.tsx
│   │       ├── micro-interactions.tsx
│   │       ├── mobile-navigation.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── responsive-container.tsx
│   │       ├── responsive-layout.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton-loader.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       ├── typography.tsx
│   │       └── use-toast.ts
│   ├── config
│   │   ├── design-system
│   │   │   ├── borderRadius.ts
│   │   │   ├── colors.ts
│   │   │   ├── index.ts
│   │   │   ├── responsive.ts
│   │   │   ├── shadows.ts
│   │   │   ├── spacing.ts
│   │   │   └── typography.ts
│   │   └── tailwind
│   │       ├── animations.ts
│   │       ├── colors.ts
│   │       └── theme.ts
│   ├── context
│   │   ├── DashboardContext.tsx
│   │   └── OrganizationContext.tsx
│   ├── docs
│   │   ├── ARCHITECTURE.md
│   │   └── feedback-schema.md
│   ├── domain
│   │   ├── interfaces
│   │   │   ├── IAnalyticsService.ts
│   │   │   ├── INotificationService.ts
│   │   │   ├── IPerformanceService.ts
│   │   │   ├── IServiceContainer.ts
│   │   │   ├── IUserInvitationService.ts
│   │   │   └── IUserService.ts
│   │   └── value-objects
│   │       ├── Email.ts
│   │       └── OrganizationId.ts
│   ├── hooks
│   │   ├── use-mobile.tsx
│   │   ├── useAccessRequest.ts
│   │   ├── useAnalytics.ts
│   │   ├── useAnalyticsData.ts
│   │   ├── useAnalyticsTableData.ts
│   │   ├── useAuditLogging.ts
│   │   ├── useAuthFlow.ts
│   │   ├── useAuthState.ts
│   │   ├── useAutoSave.ts
│   │   ├── useBatchInvitations.ts
│   │   ├── useDashboardSearch.ts
│   │   ├── useDevelopment.ts
│   │   ├── useDynamicBranding.ts
│   │   ├── useEnhancedCancelInvitation.ts
│   │   ├── useEnhancedOrganizationStats.ts
│   │   ├── useEnhancedPermissions.ts
│   │   ├── useEnhancedUserInvitation.ts
│   │   ├── useExecutiveAnalytics.ts
│   │   ├── useExecutiveInsights.ts
│   │   ├── useFeatureGate.ts
│   │   ├── useFeedbackForm.tsx
│   │   ├── useFormNavigation.ts
│   │   ├── useFormResponses.ts
│   │   ├── useFormValidation.ts
│   │   ├── useInvitationCache.ts
│   │   ├── useInvitationPerformance.ts
│   │   ├── useInvitationProcessor.ts
│   │   ├── useInviteUser.ts
│   │   ├── useMobileDetection.ts
│   │   ├── useMutationFactory.ts
│   │   ├── useOperationalAnalytics.ts
│   │   ├── useOptimizedUserInvitation.ts
│   │   ├── useOrganization.ts
│   │   ├── useOrganizationConfig.ts
│   │   ├── useOrganizationInvitations.ts
│   │   ├── useOrganizationStats.ts
│   │   ├── usePaginatedUsers.ts
│   │   ├── usePasswordReset.ts
│   │   ├── usePerformanceOptimization.ts
│   │   ├── usePrivacyConsent.ts
│   │   ├── useRBAC.ts
│   │   ├── useRealTimeAnalytics.ts
│   │   ├── useRealtimeNotifications.ts
│   │   ├── useRealtimeUpdates.ts
│   │   ├── useResponsiveDesign.ts
│   │   ├── useSaveContinue.ts
│   │   ├── useSentimentAnalysis.ts
│   │   ├── useServiceContainer.ts
│   │   ├── useServices.ts
│   │   ├── useStrategicKPIs.ts
│   │   ├── useSystemUsers.ts
│   │   ├── useUserInvitation.ts
│   │   ├── useUserManagement.ts
│   │   ├── useUserManagementWithInvitations.ts
│   │   ├── useUserMutations.ts
│   │   ├── useUserQueries.ts
│   │   └── useWebhooks.ts
│   ├── infrastructure
│   │   ├── ServiceContainer.ts
│   │   ├── ServiceRegistry.ts
│   │   ├── di
│   │   │   ├── DIContainer.ts
│   │   │   ├── ServiceRegistry.ts
│   │   │   └── ServiceTokens.ts
│   │   ├── logging
│   │   │   └── PerformanceLogger.ts
│   │   ├── performance
│   │   │   ├── ComponentTracker.ts
│   │   │   ├── MetricsAggregator.ts
│   │   │   ├── OptimizedUserInvitationService.ts
│   │   │   ├── PerformanceCollector.ts
│   │   │   ├── PerformanceMonitor.ts
│   │   │   ├── PerformanceObservers.ts
│   │   │   └── PerformanceReporter.ts
│   │   └── services
│   │       ├── BatchProcessingService.ts
│   │       ├── InvitationCacheService.ts
│   │       └── InvitationValidationService.ts
│   ├── integrations
│   │   └── supabase
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib
│   │   ├── csv.ts
│   │   └── utils.ts
│   ├── pages
│   │   ├── Admin.tsx
│   │   ├── AuthCallback.tsx
│   │   ├── Index.tsx
│   │   ├── InvitationAccept.tsx
│   │   ├── Landing.tsx
│   │   ├── NotFound.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   ├── ResetPassword.tsx
│   │   └── TermsOfService.tsx
│   ├── services
│   │   ├── EnhancedAnalyticsService.ts
│   │   ├── EnhancedNotificationService.ts
│   │   ├── EnhancedPerformanceService.ts
│   │   ├── UserService.ts
│   │   ├── advancedAnalyticsService.ts
│   │   ├── analyticsProcessor.ts
│   │   ├── analyticsService.ts
│   │   ├── apiKeysService.ts
│   │   ├── auditService.ts
│   │   ├── authService.ts
│   │   ├── customerInsightsService.ts
│   │   ├── exportService.ts
│   │   ├── feedbackService.ts
│   │   ├── flaskSmsService.ts
│   │   ├── intelligentRecommendationEngine.ts
│   │   ├── logoService.ts
│   │   ├── organizationAssets.ts
│   │   ├── organizationMutations.ts
│   │   ├── organizationQueries.ts
│   │   ├── organizationService.ts
│   │   ├── organizationService.types.ts
│   │   ├── questionsService.ts
│   │   ├── rbacService.ts
│   │   ├── responseDataProcessor.ts
│   │   ├── responseTimeService.ts
│   │   └── userInvitationService.ts
│   ├── test
│   │   ├── contextTestUtils.tsx
│   │   ├── setup.ts
│   │   └── utils.tsx
│   ├── types
│   │   ├── analytics.ts
│   │   ├── apiKey.ts
│   │   ├── organizationStats.ts
│   │   ├── questionTypes.ts
│   │   └── utilities.ts
│   └── utils
│       ├── authUtils.ts
│       ├── cacheUtils.ts
│       ├── contextValidation.ts
│       ├── createFirstAdmin.ts
│       ├── createOrganization.ts
│       ├── development.ts
│       ├── errorHandler.ts
│       ├── logger.ts
│       ├── metricCalculations.ts
│       ├── performanceUtils.ts
│       ├── roleManagement.ts
│       └── validation.ts
└── supabase
    ├── config.toml
    └── migrations
        ├── 20250612160204-237dbfaf-3bc5-4614-b004-66c0218c6f42.sql
        ├── 20250612162128-05297fbc-8f73-4744-b1ba-b2ab4a00b39c.sql
        ├── 20250612163806-4ec114b6-2e6b-425e-b05c-4d6fffd6e10e.sql
        ├── 20250612170535-5a805f0d-4312-47f8-909f-4731c23c4809.sql
        ├── 20250612172554-f05a19ff-2192-4176-9e52-5ed24032956d.sql
        ├── 20250613055231-9d1ef13a-92ea-4f86-bbc2-cbf872087a31.sql
        ├── 20250613063226-a07673a1-6774-42b0-a02c-bd877cbe50cd.sql
        ├── 20250613064824-6ca6fdae-aa4a-434d-9d56-315b260ade46.sql
        ├── 20250613074116-b90e4c56-e15e-4882-acb5-ab6de78cd415.sql
        ├── 20250613084707-920c1853-a074-4622-978a-6b1c5977e1e9.sql
        ├── 20250613090333-5ace94bf-dba7-4ffa-922d-5cabdc419023.sql
        ├── 20250613095012-b92cc2e6-dd2b-49c0-9c07-94cf71468e91.sql
        ├── 20250613113110-a6deb6fc-17c2-41f7-b218-a9b99bba8db5.sql
        ├── 20250613115638-67eb3a43-beda-4f83-bf98-70c3d20243c3.sql
        ├── 20250613124258-b4bc82b6-d16e-4872-bc49-b234cc149947.sql
        ├── 20250614102303-2eb60de8-768b-4690-b123-3ecf0cc3b8b9.sql
        ├── 20250614104305-9db5f42e-8161-4bd6-a9ab-975292dd4f93.sql
        ├── 20250614124211-84725da6-8690-4311-9a4f-14a049e3bd97.sql
        ├── 20250614174547-f28e05c4-01b3-483b-a71f-61ab1ff45422.sql
        ├── 20250614194301-b15fa885-136d-42a9-b5b7-f976eb2f7d68.sql
        ├── 20250615073923-3352a228-308f-49ec-bc2e-f511fa570535.sql
        ├── 20250615080301-d2ebbc35-bfc2-422c-8f3a-4d4de4b48514.sql
        ├── 20250615093037-20d87d53-d79f-46ff-a214-d4dff98f7568.sql
        ├── 20250615104408-9c370dca-cdbe-40ea-b4d4-fdc580cf3111.sql
        ├── 20250615105111-f6dff101-1267-4512-82ec-66ab4d865325.sql
        ├── 20250615142712-ddd2da53-2e80-4853-9aa1-acccdf0dbf6b.sql
        ├── 20250615143754-d76352e5-311d-45fb-91a5-617f70d97877.sql
        ├── 20250615173216-b0633f3f-8382-4686-a852-a9213a07b011.sql
        ├── 20250616065955-23e89f9a-1f88-47bb-93f5-f4a4949bd82b.sql
        ├── 20250618042023-0e99502b-02f2-44d7-bbd2-371178abb26c.sql
        ├── 20250621095842-e596026c-521e-4f94-82da-8fc132b63fb4.sql
        ├── 20250627113240-b86d3689-ee0b-41ab-a681-d78bc231230e.sql
        ├── 20250707155031-1d2734e1-f628-4ca5-b04a-c8939ca91ef5.sql
        └── 20250712121400-fix-notification-question-text.sql
```