from fastapi import APIRouter
from app.api.v1 import (
    auth,
    families,
    trips,
    destinations,
    attractions,
    activities,
    reservations,
    documents,
    finances,
    checklists,
    emergency,
    ai,
    integrations,
    sync,
    reports,
    backup,
    audit,
    notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
api_router.include_router(families.router, prefix="/families", tags=["Família"])
api_router.include_router(trips.router, prefix="/trips", tags=["Viagens"])
api_router.include_router(destinations.router, prefix="/destinations", tags=["Destinos"])
api_router.include_router(attractions.router, prefix="/attractions", tags=["Atrações e Estabelecimentos"])
api_router.include_router(activities.router, prefix="/activities", tags=["Roteiros e Atividades"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["Reservas"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documentos"])
api_router.include_router(finances.router, prefix="/finances", tags=["Financeiro"])
api_router.include_router(checklists.router, prefix="/checklists", tags=["Checklists e Bagagem"])
api_router.include_router(emergency.router, prefix="/emergency", tags=["Contatos de Emergência"])
api_router.include_router(ai.router, prefix="/ai", tags=["Inteligência Artificial"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["Integrações Externas"])
api_router.include_router(sync.router, prefix="/sync", tags=["Sincronização Offline"])
api_router.include_router(reports.router, prefix="/reports", tags=["Relatórios e Exportações"])
api_router.include_router(backup.router, prefix="/backup", tags=["Backup e Restauração"])
api_router.include_router(audit.router, prefix="/audit", tags=["Auditoria"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notificações"])
