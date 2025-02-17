# syntax=docker/dockerfile:1
FROM node:12-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn
COPY frontend/webpack* frontend/tsconfig.json ./
COPY frontend/assets assets
COPY frontend/src src
COPY frontend/theme theme
RUN yarn run build
RUN yarn run build:server

FROM node:12-alpine AS frontend
WORKDIR /app
COPY --from=frontend-build /app/build build
COPY --from=frontend-build /app/build-server build-server
COPY frontend/package.json .

CMD ["npm", "start"]

# ----

FROM python:3.7-alpine AS build-backend
ARG EXTRA_DEPS

RUN apk add build-base musl-dev libffi-dev openssl-dev mariadb-dev

WORKDIR /app
RUN pip install -U setuptools 'cryptography>=3.0,<3.1' poetry==1.1.7
COPY backend/pyproject.toml backend/poetry.lock ./
RUN poetry config virtualenvs.path /venv
RUN poetry install --no-dev --no-ansi --no-interaction
RUN poetry run pip install -U setuptools $EXTRA_DEPS

COPY backend/manage.py backend/gunicorn.conf.py ./
COPY backend/tabby tabby
COPY --from=frontend /app/build /frontend

ARG BUNDLED_TABBY=1.0.163

RUN FRONTEND_BUILD_DIR=/frontend /venv/*/bin/python ./manage.py collectstatic --noinput
RUN FRONTEND_BUILD_DIR=/frontend /venv/*/bin/python ./manage.py add_version ${BUNDLED_TABBY}

FROM python:3.7-alpine AS backend

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

RUN apk add mariadb-connector-c

COPY --from=build-backend /app /app
COPY --from=build-backend /venv /venv

COPY backend/start.sh backend/manage.sh /
RUN chmod +x /start.sh /manage.sh
CMD ["/start.sh"]
