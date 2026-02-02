"""
LLM provider configuration helper.
"""
from dataclasses import dataclass
from typing import Optional
import os


@dataclass
class LLMConfig:
    provider: str
    api_key: Optional[str]
    base_url: Optional[str]
    model: str


def resolve_llm_config(default_model: str = "gpt-4o-mini") -> LLMConfig:
    """
    Resolve LLM provider configuration from environment variables.

    Supported providers:
    - openai (OPENAI_API_KEY)
    - groq (GROQ_API_KEY) - OpenAI compatible API
    - openrouter (OPENROUTER_API_KEY) - OpenAI compatible API

    Optional env vars:
    - LLM_PROVIDER: openai | groq | openrouter
    - LLM_MODEL: model override
    """
    provider_env = (os.getenv("LLM_PROVIDER") or "").strip().lower()

    keys = {
        "openai": os.getenv("OPENAI_API_KEY"),
        "groq": os.getenv("GROQ_API_KEY"),
        "openrouter": os.getenv("OPENROUTER_API_KEY"),
    }

    if provider_env:
        provider = provider_env
    else:
        provider = "openai"
        if keys["openai"]:
            provider = "openai"
        elif keys["groq"]:
            provider = "groq"
        elif keys["openrouter"]:
            provider = "openrouter"

    model_override = (os.getenv("LLM_MODEL") or "").strip()
    base_url = None
    api_key = keys.get(provider)

    if provider == "groq":
        base_url = "https://api.groq.com/openai/v1"
        model = model_override or "llama-3.1-8b-instant"
    elif provider == "openrouter":
        base_url = "https://openrouter.ai/api/v1"
        model = model_override or "meta-llama/llama-3.1-8b-instruct:free"
    else:
        model = model_override or default_model

    return LLMConfig(provider=provider, api_key=api_key, base_url=base_url, model=model)
