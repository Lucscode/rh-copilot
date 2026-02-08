import sys
from pathlib import Path

# Adiciona src ao path para que 'app' seja importável
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
