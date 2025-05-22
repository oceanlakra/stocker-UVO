from optparse import Option
from pydantic import BaseModel
from typing import Optional

# Base model for token properties
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    
