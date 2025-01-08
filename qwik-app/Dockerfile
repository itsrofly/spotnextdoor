FROM node:alpine

# Set work directory
WORKDIR /usr/app

# Copy project && Update work directory
COPY /spotnextdoor ./spotnextdoor
WORKDIR /usr/app/spotnextdoor

# install dependencies && Run qwik
RUN npm i
RUN npm run build
CMD npm run serve
