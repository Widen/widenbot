#
# Widenbot Example Dockerfile
#
# https://github.com/Widen/widenbot
#
FROM node

COPY . /opt/widenbot
WORKDIR /opt/widenbot

EXPOSE 8000

RUN ["npm", "install"]

CMD ["npm", "start"]
