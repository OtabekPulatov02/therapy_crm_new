import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path so we can import app
sys.path.insert(0, str(Path(__file__).parent.parent))

# Debug: print environment variables
print("🔍 Checking environment variables...")
print(f"DATABASE_URL is set: {'DATABASE_URL' in os.environ}")
if 'DATABASE_URL' in os.environ:
    db_url = os.environ['DATABASE_URL']
    # Mask password for security
    if '@' in db_url:
        masked = db_url.split('@')[0].split(':')
        if len(masked) == 2:
            masked[1] = '***'
        print(f"DATABASE_URL: {'@'.join(masked)}@{db_url.split('@')[1] if '@' in db_url else ''}")
    else:
        print(f"DATABASE_URL: {db_url[:50]}...")
else:
    print("⚠️  DATABASE_URL not found in environment!")

from app.core.config import get_settings
from app.core.db import engine
from app.models import Base

# Clear cache to force reload settings
get_settings.cache_clear()

settings = get_settings()
print(f"📊 Using database URL: {settings.database_url[:50]}..." if len(settings.database_url) > 50 else f"📊 Using database URL: {settings.database_url}")


async def init_models():
    print("🔄 Connecting to database...")
    async with engine.begin() as conn:
        print("📝 Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    asyncio.run(init_models())

