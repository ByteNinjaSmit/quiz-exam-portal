# ./server/Dockerfiles/Dockerfile.cpp
# Start from a base image with GCC installed
FROM gcc:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the C++ source code from the host machine to the container
COPY ./server/cpp-files/main.cpp /usr/src/app/


# Compile the C++ program using g++
RUN g++ -o main main.cpp

# Set the default command to run the compiled program
CMD ["./main"]
