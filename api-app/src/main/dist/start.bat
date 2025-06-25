@echo off

set SERVER_PORT=8888

pushd %~dp0

java -Dspring.profiles.active=local -Dserver.port=%SERVER_PORT% -jar api-app.jar

popd
