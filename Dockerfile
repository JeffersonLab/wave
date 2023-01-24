ARG BUILD_IMAGE=gradle:7.4-jdk17-alpine
ARG RUN_IMAGE=tomcat:10.1.4-jre17

################## Stage 0
FROM ${BUILD_IMAGE} as builder
ARG CUSTOM_CRT_URL
USER root
WORKDIR /
RUN if [ -z "${CUSTOM_CRT_URL}" ] ; then echo "No custom cert needed"; else \
       wget -O /usr/local/share/ca-certificates/customcert.crt $CUSTOM_CRT_URL \
       && update-ca-certificates \
       && keytool -import -alias custom -file /usr/local/share/ca-certificates/customcert.crt -cacerts -storepass changeit -noprompt \
       && export OPTIONAL_CERT_ARG=--cert=/etc/ssl/certs/ca-certificates.crt \
    ; fi
COPY . /app
RUN cd /app && gradle build -x test --no-watch-fs $OPTIONAL_CERT_ARG

################## Stage 1
FROM ${RUN_IMAGE} as runner
ARG CUSTOM_CRT_URL
ARG RUN_USER=tomcat
ARG DEPLOYMENTS=/usr/local/tomcat/webapps
USER root
COPY --from=builder /app/build/libs /usr/local/tomcat/webapps
RUN useradd -m tomcat \
    && if [ -z "${CUSTOM_CRT_URL}" ] ; then echo "No custom cert needed"; else \
       mkdir -p /usr/local/share/ca-certificates \
       && curl -o /usr/local/share/ca-certificates/customcert.crt $CUSTOM_CRT_URL \
       && update-ca-certificates \
    ; fi \
    && mkdir /usr/local/tomcat/conf/Catalina \
    && chown -R ${RUN_USER}:tomcat /usr/local/tomcat/conf/Catalina \
    && chown -R ${RUN_USER}:tomcat ${DEPLOYMENTS} \
    && chmod -R g+rw ${DEPLOYMENTS}
USER ${RUN_USER}
ENV TZ='America/New_York'