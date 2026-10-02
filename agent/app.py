
from langchain_ollama import ChatOllama
from prompts import SYSTEM_PROMPT


def main():
    print("MetricMind Agent")
    print("-" * 40)

    llm = ChatOllama(
        model="llama3",
        temperature=0
    )

    messages = [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            "Explain revenue and profit margin in simple business terms."
        ),
    ]

    response = llm.invoke(messages)

    print("\nLlama 3 Response:")
    print(response.content)


if __name__ == "__main__":
    main()