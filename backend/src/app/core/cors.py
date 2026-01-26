from fastapi.middleware.cors import CORSMiddleware


def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # para MVP/demo público isto é aceitável
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
