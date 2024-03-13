def is_valid_sql(result):
    """
    * should not contain instnace of "_TABLE_SUFFIX", because queries tend to break with that
    """

    if "_TABLE_SUFFIX" in result:
        print("INVALID SQL OUTPUT: contains _TABLE_SUFFIX")
        raise Exception("INVALID SQL OUTPUT: contains _TABLE_SUFFIX")

    return result
