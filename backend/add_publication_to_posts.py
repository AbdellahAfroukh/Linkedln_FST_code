from database import engine
from sqlalchemy import text

# Add publicationId column to posts table
with engine.connect() as conn:
    try:
        conn.execute(text('''
            ALTER TABLE posts
            ADD COLUMN "publicationId" INTEGER
        '''))
        conn.commit()
        print('Column publicationId added to posts table')
    except Exception as e:
        print(f'Error adding column: {e}')
        conn.rollback()
        raise
