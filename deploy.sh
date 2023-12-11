#!/bin/bash

git pull origin development
docker compose down
docker compose build --no-cache
docker compose up -d