from database import engine
from sqlalchemy import text

# Rename column from univesityId to universityId
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE laboratoires RENAME COLUMN "univesityId" TO "universityId"'))
    conn.commit()
    print('Column renamed successfully')
