"""
Seed script to add sample organization data for testing profile completion
Run this if you don't have any organizations in your database yet.
"""
from database import SessionLocal
from models.organisation import (
    University, Etablissement, Departement, 
    Laboratoire, Equipe, Specialite, ThematiqueDeRecherche
)

def seed_data():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(University).count() > 0:
            print("Organizations already exist. Skipping seed.")
            return
        
        print("Seeding organization data...")
        
        # Create University
        uni = University(nom="Université Mohammed V", ville="Rabat")
        db.add(uni)
        db.commit()
        db.refresh(uni)
        print(f"Created University: {uni.nom}")
        
        # Create Etablissement
        etab = Etablissement(
            nom="Faculté des Sciences et Techniques de Tanger (FSTT)",
            ville="Tanger",
            universityId=uni.id
        )
        db.add(etab)
        db.commit()
        db.refresh(etab)
        print(f"Created Etablissement: {etab.nom}")
        
        # Create Departement
        dept = Departement(
            nom="Département d'Informatique",
            etablissementId=etab.id
        )
        db.add(dept)
        db.commit()
        db.refresh(dept)
        print(f"Created Departement: {dept.nom}")
        
        # Create Laboratoire
        lab = Laboratoire(nom="Laboratoire de Recherche en Informatique")
        db.add(lab)
        db.commit()
        db.refresh(lab)
        print(f"Created Laboratoire: {lab.nom}")
        
        # Create Equipe
        equipe = Equipe(nom="Equipe Intelligence Artificielle", laboratoireId=lab.id)
        db.add(equipe)
        db.commit()
        db.refresh(equipe)
        print(f"Created Equipe: {equipe.nom}")
        
        # Create Specialite
        spec = Specialite(nom="Intelligence Artificielle et Big Data")
        db.add(spec)
        db.commit()
        db.refresh(spec)
        print(f"Created Specialite: {spec.nom}")
        
        # Create Thematique
        them = ThematiqueDeRecherche(nom="Machine Learning et Data Science")
        db.add(them)
        db.commit()
        db.refresh(them)
        print(f"Created Thematique: {them.nom}")
        
        # Add more samples
        uni2 = University(nom="Université Hassan II", ville="Casablanca")
        db.add(uni2)
        
        etab2 = Etablissement(
            nom="Faculté des Sciences Ain Chock",
            ville="Casablanca",
            universityId=uni2.id
        )
        db.add(etab2)
        
        dept2 = Departement(
            nom="Département de Mathématiques",
            etablissementId=etab2.id
        )
        db.add(dept2)
        
        spec2 = Specialite(nom="Systèmes Distribués et Cloud Computing")
        db.add(spec2)
        
        them2 = ThematiqueDeRecherche(nom="Sécurité Informatique et Cryptographie")
        db.add(them2)
        
        db.commit()
        
        print("\n✅ Seed completed successfully!")
        print(f"Created: {db.query(University).count()} universities")
        print(f"Created: {db.query(Etablissement).count()} etablissements")
        print(f"Created: {db.query(Departement).count()} departements")
        print(f"Created: {db.query(Laboratoire).count()} laboratoires")
        print(f"Created: {db.query(Equipe).count()} equipes")
        print(f"Created: {db.query(Specialite).count()} specialites")
        print(f"Created: {db.query(ThematiqueDeRecherche).count()} thematiques")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
