# Francisco Herrera Project Challenge

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/)

## Setup Instructions

## Method 1: Using Docker Compose

### Step 1: Clone the Repository

```bash
git clone https://github.com/franciscoghp/fran-exoutcoding-senior.git
cd fran-exoutcoding-senior
```

### Step 2: Create Environment Variables File

Create a .env file in the root of the project and add the necessary environment variables. Here is an example:

```bash
MAKES_API_CHUNK_SIZE=1000
DATABASE_URL=mongodb+srv://franciscoghp:franciscoghp@cluster0.vojgy.mongodb.net/db_challenge
```

### Step 3: Run the Project with Docker Compose

Ensure Docker is running on your machine. Then, start the services using Docker Compose:

```bash
docker-compose up
```

This command will:

- Build and start the server.
- Pull and start PostgreSQL and Redis containers.
- Push the Prisma schema to the PostgreSQL database.
- Start the NestJS application.

## Method 2: Manual Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/franciscoghp/fran-exoutcoding-senior.git
cd fran-exoutcoding-senior
```

### Step 2: Install Dependencies

```bash
$ npm install
```

### Step 3: Configure Environment Variables

Create a .env file in the root of the project and add the necessary environment variables. Here is an example:

```bash
MAKES_API_CHUNK_SIZE=1000
DATABASE_URL=mongodb+srv://franciscoghp:franciscoghp@cluster0.vojgy.mongodb.net/db_challenge
```


### Step 7: Run the Project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

### Step 8: Running Tests

To run the tests, use the following command:

```bash
# test coverage
$ npm run test

```

## How the Application Works

GraphQL Endpoint: `http://localhost:3000/graphql`
The primary GraphQL query for this application is getJSON.

## Query

```bash
query makes($paginationInput: PaginationInput, $actualize: Boolean) {
  makes(paginationInput: $paginationInput, actualize: $actualize) {
    total
    items {
      makeId
      makeName
      vehicleTypes {
        typeId
        typeName
      }
    }
  }
}
```

## Example Input

```bash
query {
  makes(paginationInput: { skip: 0, take: 10 }, actualize: true) {
    total
    items {
      makeId
      makeName
      vehicleTypes {
        typeId
        typeName
      }
    }
  }
}

```

## Example Response

```bash
{
  "data": {
    "makes": {
      "total": 667,
      "items": [
        {
          "makeId": 475,
          "makeName": "ACURA",
          "vehicleTypes": [
            {
              "typeId": 2,
              "typeName": "Passenger Car"
            },
            {
              "typeId": 3,
              "typeName": "Truck"
            },
            {
              "typeId": 7,
              "typeName": "Multipurpose Passenger Vehicle (MPV)"
            }
          ]
        },
        {
          "makeId": 582,
          "makeName": "AUDI",
          "vehicleTypes": [
            {
              "typeId": 2,
              "typeName": "Passenger Car"
            },
            {
              "typeId": 7,
              "typeName": "Multipurpose Passenger Vehicle (MPV)"
            }
          ]
        },
        {
          "makeId": 608,
          "makeName": "280 TRAILERS",
          "vehicleTypes": [
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        },
        {
          "makeId": 609,
          "makeName": "A & E TRAILERS",
          "vehicleTypes": [
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        },
        {
          "makeId": 610,
          "makeName": "A-1 CUSTOM TRAILER AKA TOW MASTER",
          "vehicleTypes": [
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        },
        {
          "makeId": 611,
          "makeName": "A-BAR-D MFG.",
          "vehicleTypes": []
        },
        {
          "makeId": 614,
          "makeName": "A.R.M.",
          "vehicleTypes": [
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        },
        {
          "makeId": 621,
          "makeName": "ABASTECEDORA DE TRACTOPARTES Y REFACCIONES",
          "vehicleTypes": [
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        },
        {
          "makeId": 622,
          "makeName": "ABILITY METALS",
          "vehicleTypes": [
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        },
        {
          "makeId": 623,
          "makeName": "ABSOLUTE CONCEPTS",
          "vehicleTypes": [
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        }
      ]
    }
  }
}

```

### Application Logic

1. Initialization:

- The query getJSON checks if there is any data in the database.
  If there are no rows in the database, it triggers the data collection process.
- An explicit flag (refreshData) in the query can also trigger the data collection process.

2. Data Collection:

- When data collection is triggered, the Redis queue is cleared.
  The application fetches all vehicle makes from the API: `https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML`.
- If the API throws an error, it fetches the XML file from a local path: `../../data/getallmakes.xml`.
- The fetched XML data is transformed into JSON using one of two available transformers: xml2js or DOMParser.

3. Batch Processing:

- Once all vehicle makes are available, they are divided into batches of 25.
- Jobs are created for each batch and added to the queue.

4. Queue Processing:

- The queue processor handles each job by saving the vehicle makes into the Make table in the database.
- For each vehicle make, it fetches the vehicle types from the API: `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`.
- The fetched vehicle types are transformed into JSON and saved into the VehicleType table in the database.
- This process continues until all jobs are completed.

5. Job Status:

- The status of the jobs can be found in the response of the getJSON query.
- The response includes the job status, pagination information, and the transformed data.
