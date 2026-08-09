# Parcel Shipping



Application de gestion et de suivi des expéditions avec prise en charge des **POD (Proof of Delivery)**.



Le projet repose sur une architecture **microservices** utilisant Spring Boot / Spring Cloud, Eureka, Config Server, API Gateway, PostgreSQL et Docker. L'interface utilisateur est développée avec Next.js.



Le système inclut également Prometheus, Grafana et cAdvisor pour la supervision des services et l'observation de la répartition de charge.



## Lancement



### Prérequis



* Git

* Docker

* Docker Compose



### 1. Cloner le projet



```bash

git clone https://github.com/Mouad45-bit/parcel-shipping.git

cd parcel-shipping

```



### 2. Configurer l'environnement



Se placer dans le backend :



```bash

cd parcel-shipping-backend

```



Créer le fichier `.env` à partir de l'exemple :



```bash

cp .env.example .env

```



Sous PowerShell :



```powershell

Copy-Item .env.example .env

```



Renseigner ensuite `AUTH_JWT_SECRET` dans `.env` avec une clé secrète suffisamment longue.



Exemple :



```env

AUTH_JWT_SECRET=change-me-with-a-long-random-secret

AUTH_COOKIE_SECURE=false



SHIPMENT_POD_SEED_ENABLED=true

SHIPMENT_POD_SEED_RANDOM_SEED=parcel-shipping-demo-2026

SHIPMENT_POD_SEED_MINIMUM_COUNT=1

SHIPMENT_POD_SEED_MAXIMUM_COUNT=3

SHIPMENT_POD_SEED_BATCH_SIZE=100

SHIPMENT_POD_SEED_FAIL_FAST=true



GRAFANA_ADMIN_PASSWORD=grafana123

```



### 3. Démarrer le système



```bash

docker compose --env-file .env up -d --build

```



Vérifier les conteneurs :



```bash

docker compose ps

```



Consulter les logs :



```bash

docker compose logs --tail=100

```



Arrêter le système :



```bash

docker compose down

```



## Accès

| Service | Adresse |
| --- | --- |
| Application | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| Config Server | http://localhost:8888 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |



## Identifiants



### Application



```text

Utilisateur : backoffice

Mot de passe : operator123

```



### Grafana



```text

Utilisateur : admin

Mot de passe : grafana123

```



### PostgreSQL — Expéditions



```text

Port : 5433

Base : shipments_db

Utilisateur : shipments_user

Mot de passe : shipments_password

```



### PostgreSQL — Utilisateurs



```text

Port : 5434

Base : users_db

Utilisateur : users_user

Mot de passe : users_password

```

