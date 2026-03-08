import datetime

import isodate
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.ticker import MaxNLocator

pd.set_option("display.max_colwidth", None)
pd.set_option("display.max_rows", 500)


def read_activity_log(csv_path: str) -> pd.DataFrame:
    """Reads an activity log from a CSV file and returns records as a DataFrame.

    Returns a DataFrame with columns: Timestamp, Duration, Client, Project, Task, Notes and Category.
    The timestamp and duration are ISO 8601 formatted.
    """
    df = pd.read_csv(csv_path)
    df["Timestamp"] = pd.to_datetime(df["Timestamp"], utc=True, errors="coerce")
    df["Notes"] = df["Notes"].fillna("")
    return df


def create_timesheet(activity_log: pd.DataFrame) -> pd.DataFrame:
    """Aggregates the activity log into a timesheet.

    Returns a DataFrame with columns: Date, Client, Project, Task, Category and Hours.
    """
    timesheet = activity_log.copy()
    timesheet["Date"] = timesheet["Timestamp"].dt.date
    timesheet["Hours"] = (
        timesheet["Duration"].apply(isodate.parse_duration).dt.total_seconds() / 3600
    )
    grouped = timesheet.groupby(
        ["Date", "Client", "Project", "Task", "Category"], as_index=False
    )["Hours"].sum()
    grouped["Hours"] = grouped["Hours"].round(2)
    return grouped


def write_harvest_timesheet(
    timesheet: pd.DataFrame, csv_path: str, first_name="", last_name=""
):
    """Writes the timesheet to a CSV file in the format expected by Harvest."""
    harvest = timesheet.copy()
    harvest["Notes"] = harvest["Task"]
    harvest["Task"] = harvest["Category"]
    harvest["First name"] = first_name
    harvest["Last name"] = last_name
    harvest = harvest[
        [
            "Date",
            "Client",
            "Project",
            "Task",
            "Notes",
            "Hours",
            "First name",
            "Last name",
        ]
    ]
    harvest.to_csv(csv_path, index=False)


def filter_timesheet(
    timesheet: pd.DataFrame,
    start_date: str | datetime.date = None,
    end_date: str | datetime.date = None,
    client: str | list[str] = None,
    project: str | list[str] = None,
    task: str | list[str] = None,
    category: str | list[str] = None,
) -> pd.DataFrame:
    """Filters the timesheet based on the provided criteria."""
    filtered = timesheet.copy()
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = datetime.date.fromisoformat(start_date)
        filtered = filtered[filtered["Date"] >= start_date]
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = datetime.date.fromisoformat(end_date)
        filtered = filtered[filtered["Date"] <= end_date]
    if client is not None:
        if isinstance(client, str):
            client = [client]
        filtered = filtered[filtered["Client"].isin(client)]
    if project is not None:
        if isinstance(project, str):
            project = [project]
        filtered = filtered[filtered["Project"].isin(project)]
    if task is not None:
        if isinstance(task, str):
            task = [task]
        filtered = filtered[filtered["Task"].isin(task)]
    if category is not None:
        if isinstance(category, str):
            category = [category]
        filtered = filtered[filtered["Category"].isin(category)]
    return filtered.reset_index(drop=True)


def create_activities(timesheet: pd.DataFrame) -> pd.DataFrame:
    """Aggregates the timesheet into activities.

    Returns a DataFrame with columns: Client, Project, Task, Start Date, End Date and Cycle Time.
    """
    grouped = (
        timesheet.groupby(["Client", "Project", "Task"])["Date"]
        .agg(["min", "max"])
        .reset_index()
    )
    grouped = grouped.rename(columns={"min": "Start Date", "max": "End Date"})
    grouped["Start Date"] = pd.to_datetime(grouped["Start Date"])
    grouped["End Date"] = pd.to_datetime(grouped["End Date"])
    grouped["Cycle Time"] = (grouped["End Date"] - grouped["Start Date"]).dt.days + 1
    grouped = grouped.sort_values(["Client", "Project", "Task"]).reset_index(drop=True)
    return grouped


def create_projects(timesheet: pd.DataFrame) -> pd.DataFrame:
    """Aggregate activities into projects by client.

    Returns a DataFrame with columns: Client, Project, Start Date, End Date, Cycle Time.
    """
    grouped = (
        timesheet.groupby(["Client", "Project"])["Date"]
        .agg(["min", "max"])
        .reset_index()
    )
    grouped = grouped.rename(columns={"min": "Start Date", "max": "End Date"})
    grouped["Start Date"] = pd.to_datetime(grouped["Start Date"])
    grouped["End Date"] = pd.to_datetime(grouped["End Date"])
    grouped["Cycle Time"] = (grouped["End Date"] - grouped["Start Date"]).dt.days + 1
    grouped = grouped.sort_values(["Client", "Project"]).reset_index(drop=True)
    return grouped


def analyze_burn_up(activities: pd.DataFrame) -> pd.DataFrame:
    """Analyzes the burn-up of activities over time.

    Returns a DataFrame with columns: Date, In Progress Activities and Completed Activities.
    """
    if activities.empty:
        return pd.DataFrame(columns=["Date", "WIP", "Done"])

    end_counts = activities["End Date"].value_counts().sort_index()
    min_date = activities["Start Date"].min()
    max_date = activities["End Date"].max()
    all_dates = pd.date_range(min_date, max_date)
    completed = end_counts.reindex(all_dates, fill_value=0)
    burn_up = completed.cumsum().reset_index()
    burn_up.columns = ["Date", "Done"]

    in_progress = []
    for current_date in all_dates:
        count = (
            (activities["Start Date"] <= current_date)
            & (activities["End Date"] >= current_date)
        ).sum()
        in_progress.append(count)
    burn_up["WIP"] = in_progress

    return burn_up


def plot_burn_up(burn_up: pd.DataFrame):
    """Plots the burn-up chart as a stacked chart for WIP and done over time."""
    fig, ax = plt.subplots(figsize=(15, 5))
    if not burn_up.empty:
        dates = burn_up["Date"]
        done = burn_up["Done"]
        wip = burn_up["WIP"]
        ax.stackplot(
            dates,
            done,
            wip,
            labels=["Done", "WIP"],
            colors=["tab:orange", "tab:blue"],
            alpha=0.7,
        )
        x_ideal = [dates.iloc[0], dates.iloc[-1]]
        y_ideal = [done.iloc[0], done.iloc[-1]]
        ax.plot(
            x_ideal,
            y_ideal,
            color="tab:red",
            linestyle="--",
            linewidth=1,
            label="Ideal Burn-up",
        )
    ax.set_xlabel("Date")
    ax.set_ylabel("# of Activities")
    ax.set_title("Burn-up Chart")
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m-%d"))
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    ax.grid(True, linestyle="--", alpha=0.5)
    plt.xticks(rotation=45)
    ax.legend(loc="upper left")
    fig.tight_layout()
    plt.show()

    if not burn_up.empty:
        days = (burn_up["Date"].iloc[-1] - burn_up["Date"].iloc[0]).days + 1
        print(f"Cycle Time: {days} days")
        throughput = burn_up["Done"].max()
        print(f"Throughput: {throughput} tasks")


def analyze_cycle_times(activities: pd.DataFrame) -> pd.DataFrame:
    """Analyzes the cycle times of activities.

    Returns a DataFrame with columns: Cycle Time, Count, Probability and Cumulative Probability.
    """
    stats = activities["Cycle Time"].value_counts().sort_index().reset_index()
    stats.columns = ["Cycle Time", "Count"]
    stats["Probability"] = stats["Count"] / stats["Count"].sum()
    stats["Cumulative Probability"] = stats["Probability"].cumsum()
    return stats


def plot_cycle_times(cycle_times: pd.DataFrame):
    """Plots the distribution of cycle times with a bar chart for counts and a line for cumulative probability."""
    fig, ax1 = plt.subplots(figsize=(10, 5))
    color = "tab:blue"
    ax1.bar(
        cycle_times["Cycle Time"],
        cycle_times["Count"],
        color=color,
        alpha=0.7,
        label="Count",
    )
    ax1.set_xlabel("Cycle Time (days)")
    ax1.set_ylabel("Count", color=color)
    ax1.tick_params(axis="y", labelcolor=color)
    ax1.set_title("Cycle Time Distribution")
    ax1.grid(True, linestyle="--", alpha=0.5)

    ax2 = ax1.twinx()
    color = "tab:red"
    ax2.plot(
        cycle_times["Cycle Time"],
        cycle_times["Cumulative Probability"],
        color=color,
        label="Cumulative Probability",
    )
    ax2.set_ylabel("Cumulative Probability", color=color)
    ax2.tick_params(axis="y", labelcolor=color)
    ax2.set_ylim(0, 1.05)

    ax2.axhline(y=0.85, color="tab:orange", linestyle="--", label="85% Probability")

    ax2.legend(loc="lower right")
    fig.tight_layout()
    plt.show()

    if not cycle_times[cycle_times["Cumulative Probability"] > 0.85].empty:
        threshold = cycle_times[cycle_times["Cumulative Probability"] > 0.85].iloc[0]
    else:
        threshold = None
    if threshold is not None:
        print(f"85% of activities are completed within {threshold['Cycle Time']} days.")
    else:
        print("Could not determine the 85% threshold for cycle times.")


def analyze_throughput(activities: pd.DataFrame) -> pd.DataFrame:
    """Analyzes the throughput of activities.

    Returns a DataFrame with columns: Throughput, Count, Probability and Cumulative Probability.
    """
    end_counts = activities["End Date"].value_counts().sort_index()
    min_date = activities["Start Date"].min()
    max_date = activities["End Date"].max()
    all_dates = pd.date_range(min_date, max_date)
    completed = end_counts.reindex(all_dates, fill_value=0)
    throughputs = completed.reset_index()
    throughputs.columns = ["Date", "Throughput"]

    stats = throughputs["Throughput"].value_counts().sort_index().reset_index()
    stats.columns = ["Throughput", "Count"]
    stats["Probability"] = stats["Count"] / stats["Count"].sum()
    stats["Cumulative Probability"] = stats["Probability"].cumsum()
    return stats


def plot_throughput(throughputs: pd.DataFrame):
    """Plots the distribution of throughputs with a bar chart for counts and a line for cumulative probability."""
    fig, ax1 = plt.subplots(figsize=(10, 5))
    color = "tab:blue"
    ax1.bar(
        throughputs["Throughput"],
        throughputs["Count"],
        color=color,
        alpha=0.7,
        label="Count",
    )
    ax1.set_xlabel("Throughput")
    ax1.set_ylabel("Count", color=color)
    ax1.tick_params(axis="y", labelcolor=color)
    ax1.set_title("Throughput Distribution")
    ax1.grid(True, linestyle="--", alpha=0.5)

    ax2 = ax1.twinx()
    color = "tab:red"
    ax2.plot(
        throughputs["Throughput"],
        throughputs["Cumulative Probability"],
        color=color,
        label="Cumulative Probability",
    )
    ax2.set_ylabel("Cumulative Probability", color=color)
    ax2.tick_params(axis="y", labelcolor=color)
    ax2.set_ylim(0, 1.05)

    ax2.axhline(y=0.85, color="tab:orange", linestyle="--", label="85% Probability")

    ax2.legend(loc="lower right")
    fig.tight_layout()
    plt.show()

    if not throughputs[throughputs["Cumulative Probability"] > 0.85].empty:
        threshold = throughputs[throughputs["Cumulative Probability"] > 0.85].iloc[0]
    else:
        threshold = None
    if threshold is not None:
        print(f"85% of days have a maximal throughput of {threshold['Throughput']}.")
    else:
        print("Could not determine the 85% threshold for throughput.")
