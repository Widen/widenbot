#
# Widenbot Dockerfile
#
# https://github.com/Widen/widenbot
#
FROM node

#RUN groupadd -r widenbot && useradd -r -g widenbot widenbot

COPY . /opt/widenbot
WORKDIR /opt/widenbot

EXPOSE 8000

RUN ["npm", "install"]

CMD ["npm", "start"]
