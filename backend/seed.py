"""
Script de seed para criar usuário administrador inicial e dados de demonstração.
"""
from app.core.database import SessionLocal, Base, engine
from app.models.models import User, FamilyGroup, FamilyMember
from app.core.security import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@viagens.com").first()
        if not user:
            user = User(
                name="Administrador",
                email="admin@viagens.com",
                hashed_password=get_password_hash("admin123"),
                phone="(11) 99999-9999"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            family = FamilyGroup(
                name="Família Principal",
                admin_id=user.id
            )
            db.add(family)
            db.commit()
            db.refresh(family)

            member = FamilyMember(
                family_id=family.id,
                user_id=user.id,
                role="admin",
                nickname="Admin"
            )
            db.add(member)
            db.commit()
            print("Usuário administrador criado com sucesso!")
            print("E-mail: admin@viagens.com")
            print("Senha:  admin123")
        else:
            print("Usuário administrador já existe no banco de dados.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

