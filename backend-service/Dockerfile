# syntax=docker/dockerfile:1

FROM golang:1.25.1-alpine AS builder

WORKDIR /app

# System deps
RUN apk add --no-cache git ca-certificates && update-ca-certificates

# Optional: trust corporate CA
COPY certs/zscaler.pem /usr/local/share/ca-certificates/zscaler.pem
RUN update-ca-certificates

# Cache Go deps
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/api ./cmd/api


FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates && update-ca-certificates

# Optional: trust corporate CA in runtime too
COPY certs/zscaler.pem /usr/local/share/ca-certificates/zscaler.pem
RUN update-ca-certificates

COPY --from=builder /bin/api /app/api

EXPOSE 8080

CMD ["/app/api"]
