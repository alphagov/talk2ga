import os

DATASETS = {
    "sandbox": "data-insights-experimentation.chat_analytics_sandbox",
    "development": "data-insights-experimentation.chat_analytics_dev",
    "production": "data-insights-experimentation.chat_analytics_prod"
}

ENVIRONMENT = os.environ.get("ENVIRONMENT", "sandbox")

def get_dataset_url():
    return DATASETS[ENVIRONMENT]


if __name__ == "__main__":
    print(f"Environment: {ENVIRONMENT}")
    print(f"Dataset URL: {get_dataset_url()}")
    print()
