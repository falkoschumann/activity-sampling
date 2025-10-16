# Activity Sampling

Periodically asks the user about their current activity and logs it for
analysis.

## Domain

![Domain](domain.png)

### Start Timer

- [ ] Start the timer with the default interval when the application starts
- [x] Start the timer with a given interval

### Stop Timer

- [x] Stop the timer

### Current Interval

- [x] Notify the user when an interval is elapsed

### Log Activity

- [x] Log the activity with a client, a project, a task and optional notes
- [ ] Log optional

### Recent Activities

- [x] Group activities by working days for the last 30 days
- [x] Summarize hours worked today, yesterday, this week and this month

### Reports

- [x] Summarize hours worked for clients
- [x] Summarize hours worked on projects
- [x] Summarize hours worked on tasks
- [x] Summarize the total hours worked
- [x] Summarize in a period
- [ ] Determine lead time for clients
- [ ] Determine lead time for projects
- [ ] Determine lead time for tasks
- [ ] Determine throughput in a period

### Statistics

- [ ] Create histogram for hours worked on tasks
- [ ] Create histogram for lead times
- [ ] Create histogram for throughput
- [ ] Determine median for hours worked on tasks
- [ ] Determine median for lead times
- [ ] Determine median for throughput

### Timesheet

- [x] Summarize hours worked on tasks
- [x] Summarize the total hours worked
- [x] Summarize in a period
- [x] Compare with capacity
- [x] Take holidays into account
- [x] Take vacation into account

## Architecture

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/activity-sampling/blob/main/doc/acc.html)
