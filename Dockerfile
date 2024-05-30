FROM node:latest AS base

# Enable corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install wine
RUN dpkg --add-architecture i386
RUN apt-get update
RUN apt-get install -y wine wine32

# Copy all required files
COPY . /app

# Set work directory
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Set server port and expose it
ENV WEBSERVER_PORT=80
EXPOSE 80

CMD [ "pnpm", "start" ]