init-dev:
	docker compose up --build -d

connect:
	docker exec -it nestjs_backend bash

db-connect:
	docker exec -it postgres_db psql -U postgres_user -d postgres

remove:
	docker compose down -v