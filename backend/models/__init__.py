from database import Base

from models.user import User, Projet
from models.organisation import Univerity, Etablissement, Departement, Laboratoire,ThematiqueDeRecherche, Specialite, Equipe
from models.associations import user_thematique_association, user_specialite_association
from models.google_scholar import GoogleScholarIntegration, Publication
from models.cv import CV,Contact,Competence,Formation,Langue,Experience