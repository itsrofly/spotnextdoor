FROM rust

# Set work directory
WORKDIR /usr/app

# Install postgres libqp-dev
RUN apt-get install libpq-dev
COPY /api ./api

WORKDIR /usr/app/api
RUN cargo install --path .
CMD cargo run