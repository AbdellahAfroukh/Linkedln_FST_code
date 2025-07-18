from sqlalchemy import Column, Integer, ForeignKey , Table,String
from models import Base


user_thematique_association = Table(
    'user_thematique_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('thematique_id', Integer, ForeignKey('thematiques_de_recherche.id'), primary_key=True)
)

user_specialite_association = Table(
    'user_specialite_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('specialite_id', Integer, ForeignKey('specialites.id'), primary_key=True))