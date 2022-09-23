docker stop inject-plandist-inden
docker rm inject-plandist-inden
docker build -t inject-plandist-inden .
docker run --name inject-plandist-inden -itd -p 6969:3000 inject-plandist-inden
