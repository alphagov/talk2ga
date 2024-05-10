import asyncio
from concurrent.futures import ThreadPoolExecutor


def run_async_in_new_loop(coroutine):
    new_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(new_loop)
    new_loop.run_until_complete(coroutine)
    new_loop.close()


def run_async_side_effect(fn: callable):
    """
    Run an async function in a new event loop, in a new thread
    This can be useful when you want to run an async function as a side effect from withing a langchain chain
    """
    with ThreadPoolExecutor(max_workers=1) as executor:
        executor.submit(run_async_in_new_loop, fn())
