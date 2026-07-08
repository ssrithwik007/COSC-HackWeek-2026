class KIWError(Exception):
    """Base class for all KIW errors."""
    pass


class KIWRuntimeError(KIWError):
    pass


class KIWSyntaxError(KIWError):
    pass


class KIWNameError(KIWError):
    pass


class KIWTypeError(KIWError):
    pass


class KIWBlockError(KIWError):
    pass