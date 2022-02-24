FROM alpine:3.12

RUN apk update && \
  apk add --no-cache \
  bash \
  make \
  py-pip && \
  pip install -U awscli && \
  rm -rf /tmp/* && \
  rm -rf /var/cache/apk/* && \
  rm -rf /var/tmp/*
