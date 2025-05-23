from authlib.integrations.starlette_client import OAuth
from ..config import settings

oauth = OAuth()

if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration', # For OpenID Connect
        client_kwargs={
            'scope': 'openid email profile', # Standard OIDC scopes
            # Authlib will use GOOGLE_REDIRECT_URI from config if not specified here for authorize_redirect
        }
    )

# if settings.FACEBOOK_CLIENT_ID and settings.FACEBOOK_CLIENT_SECRET:
#     oauth.register(
#         name='facebook',
#         client_id=settings.FACEBOOK_CLIENT_ID,
#         client_secret=settings.FACEBOOK_CLIENT_SECRET,
#         authorize_url='https://www.facebook.com/v12.0/dialog/oauth', # Check Facebook docs for latest API version
#         authorize_params=None,
#         access_token_url='https://graph.facebook.com/v12.0/oauth/access_token',
#         access_token_params=None,
#         userinfo_endpoint='https://graph.facebook.com/me?fields=id,name,email', # Specify fields you need
#         client_kwargs={'scope': 'email public_profile'}, # Scopes for Facebook
#     )
