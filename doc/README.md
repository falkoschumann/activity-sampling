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
- [ ] Log optional category like feature, rework, meeting, training, etc.
- [ ] Log activity with first and last name of team member

### Recent Activities

- [x] Group activities by working days for the last 30 days
- [x] Summarize hours worked today, yesterday, this week and this month

### Reports

- [x] Summarize hours worked for clients
- [x] Summarize hours worked on projects
- [x] Summarize hours worked on tasks
- [ ] Summarize hours worked for team members
- [x] Summarize the total hours worked
- [x] Summarize in a period
- [ ] Determine throughput in a period

### Statistics

- [x] Create histogram for hours worked on tasks
- [x] Create histogram for cycle times
- [ ] Create histogram for lead times
- [ ] Create histogram for throughput
- [x] Determine median for hours worked on tasks
- [x] Determine median for cycle times
- [ ] Determine median for lead times
- [ ] Determine median for throughput
- [ ] Exclude tasks not suitable for statistics

### Timesheet

- [x] Summarize hours worked on tasks
- [x] Summarize the total hours worked
- [x] Summarize in a period
- [x] Compare with capacity
- [x] Take holidays into account
- [x] Take vacation into account

### Estimate

- [ ] Estimate remaining tasks with hours worked
- [ ] Estimate remaining tasks with cycle times
- [ ] Estimate remaining tasks with lead times
- [ ] Estimate remaining tasks with throughput
- [ ] Mark the threshold of 85%

## Architecture

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/activity-sampling/blob/main/doc/acc.html)
