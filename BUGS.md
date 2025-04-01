# Intentional Bugs in Timesheet Application

This document contains a list of intentional bugs introduced into the timesheet application. It is intended for the interviewer to use when scoring candidate performance.

## Backend Bugs

### Server & Authentication

| Bug | Description | Location | Type |
|-----|-------------|----------|------|
| Hardcoded session secret | Session secret hardcoded in source code | server.ts:14 | Security |
| Unused security feature toggle | Security features are never enabled | server.ts:15 | Security/Dead Code |
| Unsecure session configuration | No HTTPS, no secure cookies | server.ts:26-33 | Security |
| Permissive CORS | CORS allows any origin | server.ts:41-47 | Security |
| Dead input validation | Function defined but never used | server.ts:50-57 | Dead Code |
| Insecure role checking | Direct string comparison | server.ts:59-68 | Security |
| Commented out security measure | CSRF protection commented out | server.ts:81-87 | Security |
| Inefficient logging | String concatenation in a loop | server.ts:98-105 | Performance |
| Verbose error responses | Returns full error details to client | server.ts:107-115 | Security |
| Logging sensitive information | Logs session secret | server.ts:134-135 | Security |
| Dead code in production check | Code only runs in production mode | server.ts:143-146 | Dead Code |
| SQL injection in login | Direct string interpolation | auth.ts:18-19 | Security |
| Insecure error responses | Different errors for invalid username vs password | auth.ts:27-33 | Security |
| Storing password in session | Password stored in session data | auth.ts:41 | Security |
| Logging credentials | Logs username and password | auth.ts:45 | Security |
| Returning password to client | Password included in response | auth.ts:52-53 | Security |
| Improper session destruction | Only deletes fields, doesn't destroy session | auth.ts:74-79 | Security |
| Dead endpoint code | Change-role endpoint documented but not implemented | auth.ts:85-98 | Dead Code |
| N+1 query | Separate queries for users and entries | timesheets.ts:18-20 | Performance |
| Manual JS joins | Joins data in JS instead of SQL | timesheets.ts:22-27 | Performance |
| Missing ID validation | No check if ID is a number | timesheets:47 | Validation |
| Employee can view any entry | No authorization check on view | timesheets.ts:60 | Security |
| No hours validation | No validation for hours range | timesheets.ts:74 | Validation |
| No duplicate date check | Can add multiple entries for same day | timesheets.ts:74 | Validation |
| Can edit approved entries | No validation to prevent editing approved entries | timesheets.ts:121 | Validation |
| No entry ownership check | Can edit other users' entries | timesheets.ts:123 | Security |
| No transaction on entry update | Potential race condition on update | timesheets.ts:125-126 | Race Condition |
| Status validation missing | No validation of status values | timesheets.ts:143 | Validation |
| Role check via query param | Using query param instead of session for role check | timesheets.ts:146-151 | Security |
| No timestamp check | No optimistic concurrency control | timesheets.ts:165 | Race Condition |
| Delete endpoint without auth | Can delete any entry regardless of ownership | timesheets.ts:179 | Security |
| No role check on reports | All users can access reports | reports.ts:7-8 | Security |
| Inefficient report query | No limit on data returned | reports.ts:14-15 | Performance |
| SQL injection in date params | Direct string interpolation in query | reports.ts:54-55 | Security |
| Race condition in cache | No locking for cache access | reports.ts:78 | Race Condition |
| Non-atomic cache update | Cache updates not atomic | reports.ts:98-100 | Race Condition |

## Frontend Bugs

### Components & API

| Bug | Description | Location | Type |
|-----|-------------|----------|------|
| Misleading form validation | Comment says hours validation but none exists | TimesheetForm.tsx:10-14 | Misdirecting Comment |
| No hours validation | No validation for max hours | TimesheetForm.tsx:16-17 | Validation |
| No form submission throttling | No debounce for form submissions | TimesheetForm.tsx:25 | Race Condition |
| Missing cleanup on unmount | No cleanup for async operations | TimesheetForm.tsx:50 | Race Condition |
| Unused validation function | Dead code for hours validation | TimesheetForm.tsx:66-77 | Dead Code |
| Misleading comment for input | Comment says max 24 hours but no max attribute | TimesheetForm.tsx:102-105 | Misdirecting Comment |
| Unused feature flag | Advanced features never enabled | TimesheetApp.tsx:9 | Dead Code |
| Unused filters state | State defined but never used | TimesheetApp.tsx:17-24 | Dead Code |
| Inefficient sorting | Double sort operation | TimesheetApp.tsx:42-49 | Performance |
| Race condition after fetch | No check if user is still logged in | TimesheetApp.tsx:51 | Race Condition |
| Insecure user role handling | Directly setting user state from API | TimesheetApp.tsx:62-63 | Security |
| Misleading credential storage | Comment says storing locally but doesn't | TimesheetApp.tsx:65-66 | Misdirecting Comment |
| Race condition in logout | UI updates before API call completes | TimesheetApp.tsx:71-76 | Race Condition |
| Misleading error handling | Comment says showing error but doesn't | TimesheetApp.tsx:78-79 | Misdirecting Comment |
| Multiple submissions possible | No loading state for form submission | TimesheetApp.tsx:86 | Race Condition |
| Inefficient array update | Creating new array instead of updater function | TimesheetApp.tsx:90-91 | Performance |
| Unused function | Advanced features toggle never called | TimesheetApp.tsx:100-106 | Dead Code |
| Dead code in conditional | Condition always false | TimesheetApp.tsx:138-146 | Dead Code |
| Missing suggested component | Comment mentions refresh button that doesn't exist | TimesheetApp.tsx:148-149 | Misdirecting Comment |
| Misleading security comment | Claims secure login but isn't | Login.tsx:10-12 | Misdirecting Comment |
| Storing credentials in state | Unused but insecure state | Login.tsx:19-24 | Security/Dead Code |
| Logging credentials | Console logging username and password | Login.tsx:25-29 | Security |
| Multiple login submissions | No protection against multiple quick submissions | Login.tsx:39 | Race Condition |
| Storing credentials in localStorage | Insecure storage of credentials | Login.tsx:42-44 | Security |
| Misleading counter comment | Claims to count login attempts but doesn't | Login.tsx:50 | Misdirecting Comment |
| Unused remember me function | Function defined but never called | Login.tsx:57-62 | Dead Code |
| Non-functional checkbox | Remember me checkbox doesn't work | Login.tsx:90-97 | Dead Code |
| Missing password reset | Comment suggests feature exists but doesn't | Login.tsx:105-106 | Misdirecting Comment |
| Global cache with no invalidation | Cache not properly invalidated | api.ts:6 | Race Condition |
| No response validation | Not checking structure of API responses | api.ts:27-28 | Security |
| No cache invalidation before logout | Cache invalidated after request instead of before | api.ts:46-47 | Race Condition |
| Response status not checked | No check for response.ok on logout | api.ts:44 | Validation |
| Incorrect cache usage | No freshness check for cache | api.ts:56-57 | Performance |
| Misleading cache comment | Says fresh data but returns cached | api.ts:58-59 | Misdirecting Comment |
| Race condition in cache | Parallel calls can overwrite cache | api.ts:76 | Race Condition |
| No input validation | Entry not validated before sending | api.ts:88 | Validation |
| Poor cache invalidation | Cache just cleared instead of updated | api.ts:106-107 | Race Condition |
| Invalidate instead of update | Cache cleared on update instead of updated | api.ts:132-133 | Race Condition |
| Role in query parameter | Using query parameter to specify role | api.ts:146-147 | Security |
| Cache invalidation timing | Cache invalidated after getting response | api.ts:161-163 | Race Condition |
| Unused token function | getAuthToken never called | api.ts:172-177 | Dead Code |
| Credentials in URL | Username and password sent in URL | api.ts:174 | Security |