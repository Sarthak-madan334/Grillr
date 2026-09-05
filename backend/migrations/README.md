# Database migrations

The application creates tables automatically for local development. Use Alembic for deployed databases:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```
