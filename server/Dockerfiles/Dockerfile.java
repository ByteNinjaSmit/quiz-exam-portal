# ./server/Dockerfiles/Dockerfile.java
# Use OpenJDK 17 as the base image for Java
FROM openjdk:11

# Set the working directory inside the container to /usr/src/app
WORKDIR /usr/src/app

# Copy the Java source code from the host machine to the container's /usr/src/app directory
COPY ./server/java-files/Main.java /usr/src/app/


# Compile the Java program using javac
RUN javac Main.java

# Set the default command to run the Java program
CMD ["java", "Main"]
