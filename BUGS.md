# Intentional Bugs in Timesheet Application

This document contains a list of intentional bugs introduced into the timesheet application. It is intended for the interviewer to use when scoring candidate performance.

## Backend Bugs

### Server & Authentication

| Bug | Description | Location | Type |
|-----|-------------|----------|------|
| Hardcoded session secret | Session secret hardcoded in source code | server.ts:14 | Security |
| Unused security feature toggle | Security features are never enabled | server.ts:15 | Security/Dead Code |
| Unsecure session configuration | No HTTPS, no secure cookies | server.ts:26-33 | Security |
| Permissive CORS | CORS allows any origin | server.ts:42-47 | Security |
| Dead input validation | Function defined but never used | server.ts:51-57 | Dead Code |
| Insecure role checking | Direct string comparison | server.ts:60-68 | Security |
| Commented out security measure | CSRF protection commented out | server.ts:81-86 | Security |
| Inefficient logging | String concatenation in a loop | server.ts:99-105 | Performance |
| Verbose error responses | Returns full error details to client | server.ts:110-115 | Security |
| Logging sensitive information | Logs session secret | server.ts:134-135 | Security |
| Dead code in production check | Code only runs in production mode | server.ts:143-146 | Dead Code |
| SQL injection in login | Direct string interpolation | auth.ts:19-20 | Security |
| Insecure error responses | Different errors for invalid username vs password | auth.ts:29-34 | Security |
| Storing password in session | Password stored in session data | auth.ts:43 | Security |
| Logging credentials | Logs username and password | auth.ts:47 | Security |
| Returning password to client | Password included in response | auth.ts:54-55 | Security |
| Improper session destruction | Only deletes fields, doesn't destroy session | auth.ts:76-80 | Security |
| Dead endpoint code | Change-role endpoint documented but not implemented | auth.ts:88-99 | Dead Code |
| N+1 query | Separate queries for users and entries | timesheets.ts:21-22 | Performance |
| Manual JS joins | Joins data in JS instead of SQL | timesheets.ts:24-27 | Performance |
| Missing ID validation | No check if ID is a number | timesheets.ts:51 | Validation |
| Employee can view any entry | No authorization check on view | timesheets.ts:63 | Security |
| No hours validation | No validation for hours range | timesheets.ts:77-78 | Validation |
| No duplicate date check | Can add multiple entries for same day | timesheets.ts:78 | Validation |
| Can edit approved entries | No validation to prevent editing approved entries | timesheets.ts:125-130 | Validation |
| No entry ownership check | Can edit other users' entries | timesheets.ts:132-137 | Security |
| No transaction on entry update | Potential race condition on update | timesheets.ts:139-140 | Race Condition |
| Status validation missing | No validation of status values | timesheets.ts:158 | Validation |
| Role check via query param | Using query param instead of session for role check | timesheets.ts:162-168 | Security |
| No timestamp check | No optimistic concurrency control | timesheets.ts:183-184 | Race Condition |
| Delete endpoint without auth | Can delete any entry regardless of ownership | timesheets.ts:198 | Security |
| No role check on reports | All users can access reports | reports.ts:7-8 | Security |
| Inefficient report query | No limit on data returned | reports.ts:16-17 | Performance |
| SQL injection in date params | Direct string interpolation in query | reports.ts:61-62 | Security |
| Race condition in cache | No locking for cache access | reports.ts:86-87 | Race Condition |
| Non-atomic cache update | Cache updates not atomic | reports.ts:106-108 | Race Condition |

## Frontend Bugs

### Components & API

| Bug | Description | Location | Type |
|-----|-------------|----------|------|
| Misleading form validation | Comment says hours validation but none exists | TimesheetForm.tsx:10-14 | Misdirecting Comment |
| No hours validation | No validation for max hours | TimesheetForm.tsx:16-17 | Validation |
| No form submission throttling | No debounce for form submissions | TimesheetForm.tsx:25-26 | Race Condition |
| Missing cleanup on unmount | No cleanup for async operations | TimesheetForm.tsx:54-55 | Race Condition |
| Unused validation function | Dead code for hours validation | TimesheetForm.tsx:71-84 | Dead Code |
| Misleading comment for input | Comment says max 24 hours but no max attribute | TimesheetForm.tsx:102-104 | Misdirecting Comment |
| Unused feature flag | Advanced features never enabled | TimesheetApp.tsx:8-9 | Dead Code |
| Unused filters state | State defined but never used | TimesheetApp.tsx:17-24 | Dead Code |
| Inefficient sorting | Double sort operation | TimesheetApp.tsx:42-50 | Performance |
| Race condition after fetch | No check if user is still logged in | TimesheetApp.tsx:52-54 | Race Condition |
| Insecure user role handling | Directly setting user state from API | TimesheetApp.tsx:64-65 | Security |
| Misleading credential storage | Comment says storing locally but doesn't | TimesheetApp.tsx:68-69 | Misdirecting Comment |
| Race condition in logout | UI updates before API call completes | TimesheetApp.tsx:74-79 | Race Condition |
| Misleading error handling | Comment says showing error but doesn't | TimesheetApp.tsx:81-82 | Misdirecting Comment |
| Multiple submissions possible | No loading state for form submission | TimesheetApp.tsx:89-90 | Race Condition |
| Inefficient array update | Creating new array instead of updater function | TimesheetApp.tsx:94-95 | Performance |
| Unused function | Advanced features toggle never called | TimesheetApp.tsx:103-110 | Dead Code |
| Dead code in conditional | Condition always false | TimesheetApp.tsx:141-146 | Dead Code |
| Missing suggested component | Comment mentions refresh button that doesn't exist | TimesheetApp.tsx:148-149 | Misdirecting Comment |
| Misleading security comment | Claims secure login but isn't | Login.tsx:10-12 | Misdirecting Comment |
| Storing credentials in state | Unused but insecure state | Login.tsx:21-24 | Security/Dead Code |
| Logging credentials | Console logging username and password | Login.tsx:28-30 | Security |
| Multiple login submissions | No protection against multiple quick submissions | Login.tsx:40-41 | Race Condition |
| Storing credentials in localStorage | Insecure storage of credentials | Login.tsx:44-47 | Security |
| Misleading counter comment | Claims to count login attempts but doesn't | Login.tsx:53-54 | Misdirecting Comment |
| Unused remember me function | Function defined but never called | Login.tsx:61-66 | Dead Code |
| Non-functional checkbox | Remember me checkbox doesn't work | Login.tsx:94-97 | Dead Code |
| Missing password reset | Comment suggests feature exists but doesn't | Login.tsx:105-106 | Misdirecting Comment |
| Global cache with no invalidation | Cache not properly invalidated | api.ts:5-6 | Race Condition |
| No response validation | Not checking structure of API responses | api.ts:27-28 | Security |
| No cache invalidation before logout | Cache invalidated after request instead of before | api.ts:37-38 | Race Condition |
| Response status not checked | No check for response.ok on logout | api.ts:45-48 | Validation |
| Incorrect cache usage | No freshness check for cache | api.ts:60-61 | Performance |
| Misleading cache comment | Says fresh data but returns cached | api.ts:62-63 | Misdirecting Comment |
| Race condition in cache | Parallel calls can overwrite cache | api.ts:80-81 | Race Condition |
| No input validation | Entry not validated before sending | api.ts:92 | Validation |
| Poor cache invalidation | Cache just cleared instead of updated | api.ts:110-112 | Race Condition |
| Invalidate instead of update | Cache cleared on update instead of updated | api.ts:137-139 | Race Condition |
| Role in query parameter | Using query parameter to specify role | api.ts:153-154 | Security |
| Cache invalidation timing | Cache invalidated after getting response | api.ts:169-172 | Race Condition |
| Unused token function | getAuthToken never called | api.ts:182-187 | Dead Code |
| Credentials in URL | Username and password sent in URL | api.ts:184 | Security |