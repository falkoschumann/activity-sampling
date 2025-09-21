# Activity Sampling

Periodically asks the user about their current activity and logs it for
analysis.

## Domain

![Domain](domain.png)

### Start Timer

- Start the timer with the default interval when the application starts
- Start the timer with a given interval

### Stop Timer

- Stop the timer

### Current Interval

- Notify the user when an interval is elapsed

### Log Activity

- Log the activity with a client, a project, a task and optional notes

### Recent Activities

- Group activities by working days for the last 30 days
- Summarize hours worked today, yesterday, this week and this month

### Reports

- Summarize hours worked for clients
- Summarize hours worked on projects
- Summarize hours worked on tasks
- Summarize the total hours worked
- Summarize in a period

### Timesheet

- Summarize hours worked on tasks
- Summarize the total hours worked
- Summarize in a period
- Compare with capacity
- Take holidays into account
- Take vacation into account

## Architecture

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/activity-sampling/blob/main/doc/acc.html)
