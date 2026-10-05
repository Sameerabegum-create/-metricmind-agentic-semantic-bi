from query_planner import plan_query
from query_executor import execute_metric


def main():
    print("MetricMind Agent")
    print("-" * 40)

    user_question = input("\nAsk MetricMind: ")

    print("\nUnderstanding your question...")

    metric = plan_query(user_question)

    print("Governed metric:", metric)

    print("\nQuerying Snowflake...")

    result = execute_metric(metric)

    value = result["rows"][0][0]

    print("\nMetricMind Result:")
    print("-" * 40)

    if metric == "revenue":
        print(f"Total revenue: ${value:,.2f}")

    elif metric == "profit":
        print(f"Total profit: ${value:,.2f}")

    elif metric == "profit_margin":
        print(f"Profit margin: {value:.2f}%")

    elif metric == "shipping_cost":
        print(f"Total shipping cost: ${value:,.2f}")

    print("-" * 40)


if __name__ == "__main__":
    main()