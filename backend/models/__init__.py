from database import Base


from models.associations import user_thematique_association, user_specialite_association
from models.user import User, Projet
from models.organisation import Univerity, Etablissement, Departement, Laboratoire,ThematiqueDeRecherche, Specialite, Equipe
from models.google_scholar import GoogleScholarIntegration, Publication
from models.cv import CV,Contact,Competence,Formation,Langue,Experience
from models.chat import Chat, Message
from models.connection import Connection
from models.post import Post, Comment, Reaction