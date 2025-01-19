
# Directus and Medusa Integration Documentation

## Setup Process

### 1. Install and Configure Directus

1. **Install Directus:**
   ```bash
   npx create-directus-project directus-store
   cd directus-store
   npm install
   ```

2. **Start Directus:**
   ```bash
   npx directus start
   ```

3. **Configure Environment Variables:**
   Update the `.env` file with the required values:
   ```env
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_TOKEN=your_directus_static_token
   ```

4. **Set Up Collections:**
   Create the `weframe_products` collection in Directus with fields for `product_name`, `description`, `price`, and any other necessary fields. Also, generate the token in the Directus admin panel.

### 2. Starting Medusa App with Docker

This guide walks you through setting up a Medusa app with Docker.

#### 1. Clone or Initialize a Medusa App

If you don’t have the Medusa app yet, you can create one:

```bash
npx create-medusa-app@latest medusa-app
cd medusa-app
```

If you already have a Medusa app, navigate to the app directory:

```bash
cd your-medusa-app
```

#### 2. Create a `docker-compose.yml` File

If you don’t have a `docker-compose.yml` file yet, create one in your project root. This file will define the services required for Medusa (PostgreSQL, Medusa backend, etc.).

Here’s an example `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  medusa:
    image: medusajs/medusa:latest
    container_name: medusa-app
    restart: always
    environment:
      MEDUSA_DB_URL: postgres://medusa:medusa@postgres/medusa
      MEDUSA_DB_USERNAME: medusa
      MEDUSA_DB_PASSWORD: medusa
    ports:
      - "9000:9000"
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    container_name: medusa-postgres
    restart: always
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: medusa
      POSTGRES_DB: medusa
    ports:
      - "5432:5432"
```

#### 3. Start Docker Containers

To start the Medusa app and PostgreSQL database containers, use Docker Compose:

```bash
docker-compose up -d
```

This will start the Medusa backend and PostgreSQL containers.

#### 4. Verify Containers Are Running

You can check if your containers are up and running with:

```bash
docker-compose ps
```

It should show both the Medusa and PostgreSQL containers as running.

#### 5. Initialize the Database

Before you can use the Medusa app, you need to initialize the database. Run the following command:

```bash
docker-compose exec medusa bash
medusa migrations run
```

#### 6. Access the App

You can now access the Medusa admin dashboard (if enabled) and the API by visiting:

```
http://localhost:9000
```

#### 7. Stopping the Containers

To stop the running containers, use:

```bash
docker-compose down
```

This will stop and remove the containers, but your data will remain in the PostgreSQL volume.

### 3. Synchronization Setup

1. **Install Dependencies:**
   ```bash
   npm install @directus/sdk axios dotenv
   ```

2. **Create the Synchronization Script:**
   Add the provided script to your project and configure the environment variables.

3. **Run the Script:**
   ```bash
   node sync-script.js
   ```

4. **Polling Interval:**
   The script will poll for changes in Directus every 5 seconds and synchronize new or updated products with Medusa.

## Scripts and Commands

### Custom Synchronization Script

The script includes the following key functions:
- **syncProductToMedusa:** Posts new products from Directus to Medusa.
- **updateMedusaProduct:** Updates existing products in Medusa.
- **deleteMedusaProduct:** Deletes products in Medusa based on Directus updates.
- **listenForDirectusChanges:** Polls the `weframe_products` collection in Directus for changes.

### Key Commands
- **Run Synchronization Script:**
  ```bash
  node sync-script.js
  ```

- **Start Directus:**
  ```bash
  npx directus start
  ```

- **Start Medusa:**
  ```bash
  medusa develop
  ```

## Known Issues and Troubleshooting

### 1. Invalid Product Handle
- **Issue:** `Invalid product handle` error.
- **Cause:** The `title` or `handle` field contains unsafe URL characters.
- **Resolution:**
  - Sanitize the product name to remove special characters and spaces.
  - Use a regex-based transformation in the script, e.g.,
    ```javascript
    const handle = directusProduct.product_name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    ```

### 2. Missing Environment Variables
- **Issue:** Errors related to undefined `MEDUSA_URL` or `DIRECTUS_URL`.
- **Resolution:**
  - Verify that the `.env` file is correctly set up.
  - Ensure the file is loaded by using `require('dotenv').config()` in the script.

### 3. Unauthorized API Access
- **Issue:** `401 Unauthorized` when accessing Medusa or Directus APIs.
- **Resolution:**
  - Verify API keys and tokens.
  - Check user roles and permissions in Directus.
  - Ensure CORS settings are configured correctly.

- **Issue:** Errors related to undefined `DIRECTUS_TOKEN` or `MEDUSA_API_KEY`.
- **Resolution:**
  - Get the token from the Directus admin panel by logging in with the credentials that you provided or use the default credentials as:
    - **ADMIN_EMAIL:** `admin@example.com`
    - **ADMIN_PASSWORD:** `d1r3ctu5`
  - To access the `MEDUSA_API_KEY`, open Postman and use the following API request:
    ```POST
    http://localhost:9000/auth/user/emailpass
    ```
    ```body
    {
    "email": <admin_email@gmail.com>,
    "password": <admin_password>
    }
    ```

### 4. Synchronization Delays
- **Issue:** Products are not syncing in real time.
- **Resolution:**
  - Check the polling interval in the script (`setInterval` function).
  - Ensure network connectivity between Directus and Medusa.

### 5. Debugging Logs
- Enable additional logs by adding `console.log` statements in the script for debugging.
- Check logs for Directus and Medusa servers for detailed error messages.
