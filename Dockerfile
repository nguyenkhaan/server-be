# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN bunx prisma generate

# Create a symbolic link to resolve inconsistent import paths in the source code.
# This makes the generated Prisma client available at the standard node_modules path,
# allowing the TypeScript compiler to find the types during the build process.
RUN rm -rf /usr/src/app/node_modules/@prisma/client && \
    ln -s /usr/src/app/generated/prisma /usr/src/app/node_modules/@prisma/client

# build
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
# Copy generated prisma client from prerelease stage
COPY --from=prerelease /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prerelease /usr/src/app/generated ./generated
COPY --from=prerelease /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=prerelease /usr/src/app/src . 
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]