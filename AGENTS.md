# AGENTS.md

## Proyecto: FastAPI + Gemini Chat

### Stack
- **Framework**: FastAPI
- **Database**: SQLModel (SQLite) — configurable via `DATABASE_URL`
- **AI**: Google Gemini (`google-genai`)
- **Testing**: pytest con fixtures de `conftest.py`

### Comandos

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar tests
pytest

# Tests con coverage
pytest --cov=main

# Levantar servidor de desarrollo
uvicorn main:app --reload
```

### Variables de Entorno (`.env`)
- `DATABASE_URL` — Connection string de la base de datos (ej: `sqlite:///./db.sqlite`)
- `GOOGLE_API_KEY` — API key para Gemini

### Testing
Los tests usan una base SQLite en memoria (`sqlite://` con `StaticPool`), no requieren DB real ni API key real.

Fixtures disponibles en `conftest.py`:
- `session` — Sesión de base de datos aislada por test
- `client` — Cliente FastAPI con session overriden

### Estructura
- `main.py` — Endpoints, modelos, lógica de negocio
- `static/` — Frontend estático (HTML/JS)
- `tests/` — Tests de integración y unitarios

### Notas
- Gemini se mockea en tests con `unittest.mock.patch`
- El historial de chat se persiste en la base de datos
- CORS habilitado para todos los orígenes (`allow_origins=["*"]`)
