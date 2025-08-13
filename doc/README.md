# Activity Sampling

Periodically asks the user about their current activity and logs it for
analysis.

## Domain

![Domain](domain.png)

### Ask periodically

- [x] Start the countdown with a given interval
- [ ] Start countdown with the default interval when the application starts

### Current Interval

- [x] Notify the user when an interval is elapsed

### Log Activity

- [x] Log the activity with a client, a project, a task and an optional notes
- [x] Select an activity from recent activities
- [x] Select the last activity when the application starts

### Recent Activities

- [x] Return last activity
- [x] Group activities by working days for the last 30 days
- [x] Summarize hours worked today, yesterday, this week and this month

### Reports

- [x] Summarize hours worked for clients
- [x] Summarize hours worked on projects
- [x] Summarize hours worked on tasks
- [x] Summarize hours worked per day
- [x] Summarize hours worked per week
- [x] Summarize hours worked per month
- [x] Summarize hours worked per year
- [x] Summarize hours worked all the time
- [ ] Summarize hours worked in a custom period
- [x] Summarize the total hours worked

### Timesheet

- [x] Summarize hours worked on tasks
- [x] Summarize hours worked per day
- [x] Summarize hours worked per week
- [x] Summarize hours worked per month
- [x] Summarize the total hours worked
- [x] Compare with capacity
- [x] Take holidays into account
- [ ] Take vacation into account

## Events

![Events](events.png)

## Architecture

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/activity-sampling/blob/main/doc/acc.html)
