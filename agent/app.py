from query_planner import plan_query
from query_executor import execute_metric, execute_margin_analysis


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

    if metric == "profit_margin":
        result = execute_margin_analysis(market)

        revenue = result["rows"][0][0]
        profit = result["rows"][0][1]
        profit_margin = result["rows"][0][2]

        print("\nMetricMind Result:")
        print("-" * 40)

        if market:
            print(f"Profit margin ({market}): {profit_margin:.2f}%")
        else:
            print(f"Profit margin: {profit_margin:.2f}%")

        print("\nReasoning:")
        print(f"Revenue: ${revenue:,.2f}")
        print(f"Profit:  ${profit:,.2f}")

        print("\nProfit Margin = Profit / Revenue * 100")
        print(f"              = ${profit:,.2f} / ${revenue:,.2f} * 100")
        print(f"              = {profit_margin:.2f}%")

    else:
        result = execute_metric(metric, market)

        value = result["rows"][0][0]

        print("\nMetricMind Result:")
        print("-" * 40)

        if metric == "revenue":
            label = "Total revenue"
            print(
                f"{label} ({market}): ${value:,.2f}"
                if market
                else f"{label}: ${value:,.2f}"
            )

        elif metric == "profit":
            label = "Total profit"
            print(
                f"{label} ({market}): ${value:,.2f}"
                if market
                else f"{label}: ${value:,.2f}"
            )

        elif metric == "shipping_cost":
            label = "Total shipping cost"
            print(
                f"{label} ({market}): ${value:,.2f}"
                if market
                else f"{label}: ${value:,.2f}"
            )

    print("-" * 40)


if __name__ == "__main__":
    main()
