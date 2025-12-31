# Activity Sampling

Periodically asks the user about their current activity and logs it for
analysis.

## Domain

![Domain](images/domain.png)

### Start Timer

- [ ] Start the timer with the default interval when the application starts
- [x] Start the timer with a given interval

### Stop Timer

- [x] Stop the timer

### Current Interval

- [x] Notify the user when an interval is elapsed

### Log Activity

- [x] Log the activity with a client, a project, a task and with optional notes
      or category
- [ ] Log activity with first and last name of team member

### Recent Activities

- [x] Group activities by working days for the last 30 days
- [x] Summarise hours worked today, yesterday, this week and this month

### Reports

- [x] Summarise hours worked for clients
- [x] Summarise hours worked on projects
- [x] Summarise hours worked on tasks
- [x] Summarise hours worked on categories
- [ ] Summarise hours worked for team members
- [x] Summarise the total hours worked
- [x] Summarise in a period
- [ ] Determine throughput in a period
- [ ] Create cumulative flow diagram with cycle time, throughput and WIP
- [ ] Optionally aggregate clients of same project
- [ ] Filter projects by client
- [ ] Optionally aggregate categories of same task
- [ ] Filter tasks by client, project or category

### Statistics

- [x] Create histogram for hours worked on tasks
- [x] Create histogram for cycle times
- [ ] Create histogram for throughput per period
- [ ] Create histogram for WIP per period
- [x] Determine median for hours worked on tasks
- [x] Determine median for cycle times
- [ ] Determine median for throughput per period
- [ ] Determine median for WIP per period
- [ ] Exclude tasks not suitable for statistics
- [x] Filter statistic data by category

### Timesheet

- [x] Summarise hours worked on tasks
- [x] Summarise the total hours worked
- [x] Summarise in a period
- [x] Compare with capacity
- [x] Take holidays into account
- [x] Take vacation into account
- [ ] Export timesheet in Harvest format

### Estimate

- [x] Estimate tasks with cycle times
- [ ] Estimate tasks with throughput
- [x] Filter tasks by category

### Burn Up Chart

- [ ] Display done tasks over time
- [ ] Display work in progress tasks over time
- [ ] Filter tasks by category

## Architecture

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/activity-sampling/blob/main/doc/acc.html)
