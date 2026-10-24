import sys
from pathlib import Path

# Ensure apps/api directory is at the beginning of sys.path
api_root = Path(__file__).resolve().parents[1]
if str(api_root) not in sys.path:
    sys.path.insert(0, str(api_root))
