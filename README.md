# Backend challenge 💪

## Assignments:

A new client wants us to develop the services, and create the infrastructure for their new project. The client wants
their services to be fast, maintainable, and scalable. The client wants to create a service that can parse XML data and
transform it to JSON format.

- Service must parse XML
    - Parse all the Makes from: https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML
    - Get all the Vehicle Types per
      Make: https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/440?format=xml
- Service must produce JSON
    - Combine all the of XML information into a single JSON object
    - Produce an array of objects will the all of the information from the XML endpoints
    - The JSON must look like the following: https://gist.github.com/mbaigbimm/d340e7800d17737482e71c9ad1856f68
- Service must have a single endpoint to get all the data
- Service must be Dockerized
- Service must save this into a document based datastore
- Service must follow NodeJS best practices for project structure, and code

### Nice to have:

- Service may schedule a job to get XML information on a regular basis
- Service can expose GraphQL endpoint for GQL queries
- Service can contain tests for each data transformation

## Solution

### Technologies:

- NestJS + Typescript
- MongoDB + Prisma
- Docker and Docker Compose
- Jest

#### Explanation:

According to requirements, the application has to be fast, maintainable and scalable. NestJS was chosen as a main
technology because it is a progressive Node.js framework for building efficient, reliable
and scalable backend applications. It uses modern JavaScript, is built with TypeScript and utilize OOP principles, which
makes it a good choice for this project. All these features combined with TypeScript create an excellent DX (developer
experience). It also has a great community and a lot of useful plugins, for example to work with GraphQL. It is also
easily converted to microservices architecture, which makes it scalable.

MongoDB was chosen as a database because it is a well-fitted document-based database for this project (which is required
by the task). As an ORM I chose Prisma, because it is a modern and powerful ORM for Node.js. It creates a abstract layer
between the database and the application, which makes it easy to switch between databases. It generates types based on a
schema, which makes it easy (and safe!) to work with data in the application.

According to requirements, the application has to be Dockerized, so I created a Dockerfile with two-staged production
optimized configuration. I also added `docker-compose.yml` to the root directory, so you can easily test the
application (don't forget to set `DATABASE_URL` environment variable, I used MongoDB Atlas).

### Getting started

Before you start, make sure you have `DATABASE_URL` environment variable set up in `.env` or `../docker-compose.yml`
file.

Local

```bash
npm install
npm run dev
```

Docker

```bash
cd ../
docker-compose up -d --build backend
```