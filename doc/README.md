# Activity Sampling

Periodically asks the user about their current activity and logs it for
analysis.

## Domain

![Domain](domain.png)

### Ask periodically

- Starts countdown with given interval.
- Notifies user when interval is elapsed.
- Starts countdown with the default interval when the application starts.

### Log Activity

- Logs the activity with client, project, task and optional notes.
- Selects an activity from recent activities.
- Selects last activity when the application starts.

### Recent Activities

- Groups activities by working days for the last 30 days.
- Summarizes hours worked today, yesterday, this week and this month.

### Time Report

- Summarizes hours worked for clients.
- Summarizes hours worked on projects.
- Summarizes hours worked on tasks.
- Summarizes hours worked per day.
- Summarizes hours worked per week.
- Summarizes hours worked per month.
- Summarizes hours worked per year.
- Summarizes the total hours worked.

### Timesheet

- Summarize hours worked on tasks.
- Summarizes hours worked on projects per day.
- Summarizes hours worked on projects per week.
- Summarizes hours worked on projects per month.
- Compares with capacity.
- Takes holidays into account.
- Takes vacation into account.

## Events

```mermaid
classDiagram
    class IntervalElapsed {
        timestamp: Date
        duration: Duration
    }

    class ActivityLogged {
        timestamp: Date
        duration: Duration
        client: String
        project: String
        task: String
        notes?: String
    }
```

## Architecture

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/activity-sampling-ts/blob/main/doc/acc.html)
