# Feature flags
from langfuse.decorators import observe
import appconfig
from functools import wraps


def _observe():
    # This is a wrapper arround LangFuse's @_observe() decorator
    # It is used to apply the observe decorator only if the flag is true
    # Otherwise, the original function is returned and this decorator is just a pass-through
    def decorator(func):
        if appconfig.LANGFUSE_ENABLED:
            return observe()(func)
        else:

            # Return the original function if the flag is false
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)

            return wrapper

    return decorator
