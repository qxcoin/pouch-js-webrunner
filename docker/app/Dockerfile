FROM node:16-alpine

# Add supervisord
COPY --from=ochinchina/supervisord:latest /usr/local/bin/supervisord /usr/local/bin/supervisord

# Add supercronic
ADD https://github.com/aptible/supercronic/releases/download/v0.2.1/supercronic-linux-amd64 /usr/local/bin/supercronic
RUN chmod +x /usr/local/bin/supercronic

COPY ./supercronic.crontab /etc/
COPY ./supervisord.conf /etc/

COPY ./docker-entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

WORKDIR /opt/app

CMD ["start"]
