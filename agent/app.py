from query_planner import plan_query
from query_executor import execute_metric, execute_margin_analysis, execute_cost_analysis


def main():
    print("MetricMind Agent")
    print("-" * 40)

    user_question = input("\nAsk MetricMind: ")

    print("\nUnderstanding your question...")

    plan = plan_query(user_question)

    analysis_type = plan["analysis_type"]
    metric = plan["metric"]
    market = plan["market"]

    print("Analysis type:", analysis_type)
    print("Governed metric:", metric)

    if market:
        print("Geography filter:", market)

    print("\nQuerying Snowflake...")

    if analysis_type == "margin_analysis":

        result = execute_margin_analysis(market)

        revenue = result["rows"][0][0]
        profit = result["rows"][0][1]
        profit_margin = result["rows"][0][2]

        print("\nMetricMind Result:")
        print("-" * 40)

        print(
            f"Profit margin ({market}): {profit_margin:.2f}%"
            if market
            else f"Profit margin: {profit_margin:.2f}%"
        )

        print("\nReasoning:")
        print(f"Revenue: ${revenue:,.2f}")
        print(f"Profit:  ${profit:,.2f}")

        print("\nProfit Margin = Profit / Revenue * 100")
        print(f"              = ${profit:,.2f} / ${revenue:,.2f} * 100")
        print(f"              = {profit_margin:.2f}%")

    elif analysis_type == "cost_analysis":

        result = execute_cost_analysis(market)

        revenue = result["rows"][0][0]
        profit = result["rows"][0][1]
        shipping_cost = result["rows"][0][2]
        profit_margin = result["rows"][0][3]
        shipping_percent = result["rows"][0][4]

        print("\nMetricMind Result:")
        print("-" * 40)

        if market:
            print(f"Cost analysis ({market})")
        else:
            print("Cost analysis")

        print(f"\nRevenue:       ${revenue:,.2f}")
        print(f"Profit:        ${profit:,.2f}")
        print(f"Shipping Cost: ${shipping_cost:,.2f}")

        print(f"\nProfit Margin: {profit_margin:.2f}%")
        print(f"Shipping Cost: {shipping_percent:.2f}% of revenue")

        print("\nCost breakdown:")
        print(f"Shipping cost / Revenue * 100 = {shipping_percent:.2f}%")

        print("\nNote:")
        print("Material cost is not available in the dataset.")
        print("The available governed cost measure is Shipping Cost.")

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

        elif metric == "profit_margin":
            label = "Profit margin"
            print(
                f"{label} ({market}): {value:.2f}%"
                if market
                else f"{label}: {value:.2f}%"
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
