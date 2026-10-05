from query_planner import plan_query
from query_executor import execute_metric


def main():
    print("MetricMind Agent")
    print("-" * 40)

    user_question = input("\nAsk MetricMind: ")

    print("\nUnderstanding your question...")

    plan = plan_query(user_question)

    metric = plan["metric"]
    market = plan["market"]

    print("Governed metric:", metric)

    if market:
        print("Geography filter:", market)

    print("\nQuerying Snowflake...")

    result = execute_metric(metric, market)

    value = result["rows"][0][0]

    print("\nMetricMind Result:")
    print("-" * 40)

    if metric == "revenue":
        label = "Total revenue"

    elif metric == "profit":
        label = "Total profit"

    elif metric == "profit_margin":
        label = "Profit margin"

    elif metric == "shipping_cost":
        label = "Total shipping cost"

    else:
        label = metric

    if market:
        print(f"{label} ({market}): ${value:,.2f}")
    elif metric == "profit_margin":
        print(f"{label}: {value:.2f}%")
    else:
        print(f"{label}: ${value:,.2f}")

    print("-" * 40)


if __name__ == "__main__":
    main()
