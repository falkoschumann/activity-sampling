FROM node:lts

ENV TZ="Europe/Berlin"
RUN npm install -g bun

CMD ["bash"]
