from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)

    password_hash = Column(String(500), nullable=False)

    role = Column(String(50), default="user")  # user / admin
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    scans = relationship(
        "ScanHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target = Column(String(300), nullable=False)
    port_range = Column(String(100), nullable=False)

    result_json = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="scans")
