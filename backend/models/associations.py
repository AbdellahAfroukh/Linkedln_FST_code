from sqlalchemy import Column, Integer, ForeignKey , Table
from models import Base


user_thematique_association = Table(
    'user_thematique_association',
    Base.metadata,
    Column('userId', Integer, ForeignKey('users.id'), primary_key=True),
    Column('thematiqueId', Integer, ForeignKey('thematiques_de_recherche.id'), primary_key=True)
)

user_specialite_association = Table(
    'user_specialite_association',
    Base.metadata,
    Column('userId', Integer, ForeignKey('users.id'), primary_key=True),
    Column('specialiteId', Integer, ForeignKey('specialites.id'), primary_key=True))