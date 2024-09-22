FROM node:22.3.0-alpine
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

USER node
WORKDIR /home/node/app
COPY --chown=node:node tsconfig.base.json tsconfig.json .env package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

COPY --chown=node:node . .
RUN pnpm exec prisma generate
ENV NODE_ENV=production
RUN pnpm -r build

CMD node --env-file=.env dist/index.js
