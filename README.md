# Catalog

## Pre-setup

Clone the app and create .env file:

```bash
cp .env.example .env
```

After that you have two options: either run via docker compose or run locally

## Run via docker compose

```bash
docker compose up --build
```

## Run locally

### Setup Node.js manager:

Install [FNM](https://github.com/Schniz/fnm) and [configure](https://github.com/Schniz/fnm/blob/master/README.md#shell-setup) with: `fnm env --use-on-cd --version-file-strategy=recursive --corepack-enabled --resolve-engines`

### Update hosts file on your machine

Add `127.0.0.1       mongodb.localhost` to your hosts file.

### Install dependencies

```bash
pnpm install
```

### Start MongoDB server in separate terminal window:

```bash
docker compose up mongodb.localhost --build
```

### Run the app locally:

```bash
pnpm dev
```

## Test the app

Navigate to http://localhost:4001/swagger-ui to see the API documentation and test the endpoints.
