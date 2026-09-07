import re


USERNAME_PATTERN = re.compile(r"^[a-z0-9_-]{3,30}$")


def normalize_username(value: str) -> str:
    normalized = value.lower()
    if not USERNAME_PATTERN.fullmatch(normalized):
        raise ValueError("Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens.")
    return normalized