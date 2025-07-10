# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Declare your build‑time args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_KEY
ARG GEMINI_API_KEY

# 2) Export them so Next.js sees them during `npm run build`
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_KEY=$NEXT_PUBLIC_SUPABASE_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app

# 3) Re-declare GEMINI_API_KEY if you need it in server code at runtime
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

COPY package*.json ./
RUN npm install --omit=dev

# 4) Bring over your build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000
CMD ["npm", "start"]
