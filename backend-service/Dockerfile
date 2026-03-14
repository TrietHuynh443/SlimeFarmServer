# Build stage
FROM golang:1.25.1-alpine AS builder

WORKDIR /app

# Needed for fetching private modules via git (optional)
RUN apk add --no-cache git ca-certificates && update-ca-certificates

# Trust Zscaler (corporate MITM) root CA
COPY certs/zscaler.pem /usr/local/share/ca-certificates/zscaler.pem
RUN update-ca-certificates

# Cache deps
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

# Run stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates && update-ca-certificates

WORKDIR /app
COPY --from=builder /bin/api /app/api

EXPOSE ${API_INTERNAL_PORT}
CMD ["/app/api"]
