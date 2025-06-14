from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from db import Base, engine, SessionLocal
from models import User, Message
from auth import router as auth_router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware for OAuth2
app.add_middleware(SessionMiddleware, secret_key="your-secret-session-key")

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/me")
def get_user(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"message": "Not logged in"}, status_code=401)
    return user

@app.post("/chat")
async def chat(request: Request, data: dict, db: Session = Depends(get_db)):
    user_data = request.session.get("user")
    if not user_data:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    
    user = db.query(User).filter(User.id == user_data['id']).first()
    
    question = data.get("message")
    history = db.query(Message).filter(Message.user_id == user.id).order_by(Message.timestamp.desc()).limit(5).all()
    context = " ".join([m.content + " " + m.response for m in reversed(history)])

    # Dummy response for now
    response = f"You asked: {question}. (Context: {context})"

    msg = Message(user_id=user.id, content=question, response=response)
    db.add(msg)
    db.commit()

    return {"response": response}
