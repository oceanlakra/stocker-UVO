from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime # For created_at in response models

# Base model for user properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None # Make password optional for updates

# Properties stored in DB (base)
class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime.datetime
    # You might not want to expose hashed_password

    class Config:
        from_attributes = True # For Pydantic v2 (use orm_mode = True for Pydantic v1)

# Additional properties to return to client
class User(UserInDBBase):
    pass # No extra fields for now, but can add later