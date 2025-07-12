
# Project Best Practices & Safe Steps

This document outlines a set of best practices and "safe steps" derived from past development and debugging sessions. Following these guidelines will help prevent common issues and ensure smoother development.

## 1. Sync Database Schema with Application Logic

**Problem:** Application logic (e.g., creating a new user membership) can conflict with database constraints (e.g., a user can only belong to one organization), causing runtime errors.

**Best Practice:**
- **Know Your Schema:** Before writing code that interacts with the database, review the relevant table structures and constraints in `supabase/migrations/`.
- **Match Logic to Constraints:** Ensure your backend functions respect database rules. For example, if a user can only have one of a certain record, the logic to "assign" or "change" that record should perform an `UPDATE` on the existing record, not an `INSERT` for a new one.

## 2. Debug Supabase Edge Functions Effectively

**Problem:** Client-side errors from Edge Functions are often generic (e.g., "Edge Function returned a non-2xx status code"), hiding the real cause of the issue.

**Best Practice:**
- **Check Function Logs:** The most critical step is to check the logs for the specific function in your Supabase Dashboard (Project > Functions > [function-name] > Logs). This provides detailed error messages, stack traces, and `console.log` output.
- **Log Aggressively:** When developing or debugging a function, add `console.log()` statements to trace the execution flow and inspect variable values.
- **Return Clear Errors:** Instead of letting a function crash, catch errors and return a meaningful JSON error message with a proper status code (e.g., 400 for bad request, 404 for not found, 409 for conflict).

## 3. Ensure Frontend & Backend Payloads Match

**Problem:** The frontend might send a data payload (e.g., in a mutation) that doesn't match the parameters expected by the backend Edge Function, leading to errors.

**Best Practice:**
- **Single Source of Truth for Types:** Ideally, share types between the frontend and backend. If not possible, keep them meticulously in sync.
- **Validate on Both Ends:** The frontend should ensure it's sending all required fields. The backend function should validate the incoming request body to ensure all required parameters are present before proceeding.

## 4. Handle Data Fetching and Mutations Gracefully

**Problem:** Failed API calls can crash parts of the UI or leave the user without feedback.

**Best Practice:**
- **Use React Query Callbacks:** When using `useMutation` from TanStack React Query, implement the `onSuccess` and `onError` callbacks.
- **Provide User Feedback:** In `onSuccess`, show a success toast (e.g., "User assigned successfully"). In `onError`, show an error toast with a clear message derived from the error object. This provides a much better user experience.
- **Invalidate Queries on Success:** In the `onSuccess` callback of a mutation, use `queryClient.invalidateQueries()` to refetch related data and keep the UI up-to-date automatically.

