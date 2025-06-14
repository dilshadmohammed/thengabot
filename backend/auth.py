from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from starlette.config import Config
from db import SessionLocal
from models import User
import os

config = Config('.env')
router = APIRouter()

oauth = OAuth(config)
oauth.register(
    name='google',
    client_id=config('GOOGLE_CLIENT_ID'),
    client_secret=config('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

FRONTEND_URL = config('FRONTEND_URL')

@router.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/auth')
async def auth(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token['userinfo']
    
    db: Session = SessionLocal()
    user = db.query(User).filter(User.google_id == user_info['sub']).first()
    
    if not user:
        user = User(
            google_id=user_info['sub'],
            name=user_info['name'],
            email=user_info['email']
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Store session for the user
    request.session['user'] = {
        'id': user.id,
        'name': user.name,
        'email': user.email
    }

    return RedirectResponse(url=FRONTEND_URL)
