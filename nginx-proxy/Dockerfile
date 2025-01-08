FROM nginx:alpine

# Arguments
ARG DOMAIN=localhost

# Config nginx
COPY default.conf /etc/nginx/conf.d/default.conf
COPY client_max_body_size.conf /etc/nginx/conf.d/client_max_body_size.conf
RUN cd /etc/nginx/conf.d && cat ./default.conf | sed "s/DOMAIN/$DOMAIN/" > default.conf

# Config domain
RUN if [ "$DOMAIN" != "localhost" ]; then \
	cd /etc/nginx/conf.d && sed -i "s/#//g" default.conf; \
    fi
