from auth import get_password_hash  # type: ignore
try:
    print(get_password_hash("password123"))
except Exception as e:
    import traceback
    traceback.print_exc()
