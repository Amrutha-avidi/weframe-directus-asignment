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
3. **Configure Environment Variables:** Update the `.env` file with the required values:
   ```env
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_TOKEN=your_directus_static_token
   ```
4. **Set Up Collections:** Create the `weframe_products` collection in Directus with fields for `product_name`, `description`, `price`, and any other necessary fields. and generate the token in the directus admin panel 

### 2. Install and Configure Medusa
1. **Install Medusa CLI:**
   ```bash
   npm install -g @medusajs/medusa-cli
   ```
2. **Create a Medusa Project:**
   ```bash
   medusa new my-medusa-store
   cd my-medusa-store
   ```
3. **Start Medusa Server:**
   ```bash
   npm run dev
   ```
4. **Configure Environment Variables:** Update the `.env` file with the required values:
   ```env
   MEDUSA_URL=http://localhost:9000
   MEDUSA_API_KEY=your_medusa_admin_api_key
   ```

### 3. Synchronization Setup
1. **Install Dependencies:**
   ```bash
   npm install @directus/sdk axios dotenv
   ```
2. **Create the Synchronization Script:** Add the provided script to your project and configure the environment variables.
3. **Run the Script:**
   ```bash
   node sync-script.js
   ```
4. **Polling Interval:** The script will poll for changes in Directus every 5 seconds and synchronize new or updated products with Medusa.

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
- **Issue:**
  Error: `Invalid product handle`.
- **Cause:**
  The `title` or `handle` field contains unsafe URL characters.
- **Resolution:**
  - Sanitize the product name to remove special characters and spaces.
  - Use a regex-based transformation in the script, e.g.,
    ```javascript
    const handle = directusProduct.product_name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    ```

### 2. Missing Environment Variables
- **Issue:**
  Errors related to undefined `MEDUSA_URL` or `DIRECTUS_URL`.
- **Resolution:**
  - Verify that the `.env` file is correctly set up.
  - Ensure the file is loaded by using `require('dotenv').config()` in the script.


### 3. Unauthorized API Access
- **Issue:**
  `401 Unauthorized` when accessing Medusa or Directus APIs.
- **Resolution:**
  - Verify API keys and tokens.
  - Check user roles and permissions in Directus.
  - Ensure CORS settings are configured correctly.
- **Issue:**
  Errors related to undefined `DIRECTUS_TOKEN` or `MEDUSA_API_KEY`.
- **Resolution:**
  - Get the token from the directus admin panel by logging in with the credentials that you gave or it produces the default credentials as  ADMIN_EMAIL: "admin@example.com" ADMIN_PASSWORD: "d1r3ctu5"
  - To access the MEDUSA_API_KEY open postmam and you get a token and paste that token in .env file for Authorization.
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
- **Issue:**
  Products are not syncing in real time.
- **Resolution:**
  - Check the polling interval in the script (`setInterval` function).
  - Ensure network connectivity between Directus and Medusa.

### 5. Debugging Logs
- Enable additional logs by adding `console.log` statements in the script for debugging.
- Check logs for Directus and Medusa servers for detailed error messages.

