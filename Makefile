.PHONY: help build up down logs seed clean

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Construir las imágenes Docker
	docker-compose build

up: ## Iniciar todos los servicios
	docker-compose up -d
	@echo "✅ Servicios iniciados!"
	@echo "   Backend: http://localhost:3000"
	@echo "   Adminer: http://localhost:8080"

dev: ## Iniciar en modo desarrollo
	docker-compose -f docker-compose.dev.yml up

down: ## Detener todos los servicios
	docker-compose down

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-backend: ## Ver logs solo del backend
	docker-compose logs -f backend

logs-db: ## Ver logs solo de PostgreSQL
	docker-compose logs -f postgres

seed: ## Ejecutar seeds (inicializar datos)
	chmod +x init-db.sh
	./init-db.sh

restart: ## Reiniciar servicios
	docker-compose restart

clean: ## Limpiar todo (incluyendo volúmenes)
	docker-compose down -v
	docker system prune -f

ps: ## Ver estado de los contenedores
	docker-compose ps

shell-backend: ## Acceder al shell del backend
	docker exec -it el-tito-backend sh

shell-db: ## Acceder al shell de PostgreSQL
	docker exec -it el-tito-postgres psql -U postgres -d el_tito_pizzeria

backup-db: ## Crear backup de la base de datos
	docker exec el-tito-postgres pg_dump -U postgres el_tito_pizzeria > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup creado!"

restore-db: ## Restaurar backup (uso: make restore-db FILE=backup.sql)
	docker exec -i el-tito-postgres psql -U postgres el_tito_pizzeria < $(FILE)
	@echo "✅ Backup restaurado!"