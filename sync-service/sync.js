"use strict";

require('dotenv').config();

const { createDirectus, staticToken, readItems, rest } = require('@directus/sdk');
const axios = require('axios');

// Initialize Directus SDK with REST functionality
const client = createDirectus(process.env.DIRECTUS_URL).with(rest()).with(staticToken(process.env.DIRECTUS_TOKEN));

// Medusa API configuration
const medusa = axios.create({
  baseURL: process.env.MEDUSA_URL,
  headers: {
    Authorization: `Bearer ${process.env.MEDUSA_API_KEY}`,
  },
});

// Fetch all products from Medusa
async function fetchMedusaProducts() {
  try {
    const response = await medusa.get('/admin/products', {
      params: { limit: 100 }, // Adjust limit as needed
    });
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products from Medusa:', error.response?.data || error.message);
    return [];
  }
}

// Synchronization function
async function syncNewProductsToMedusa(directusProducts) {
  try {
    // Fetch existing Medusa products
    const medusaProducts = await fetchMedusaProducts();

    // Map Medusa product titles for quick lookup
    const medusaProductTitles = new Set(medusaProducts.map((p) => p.title));

    for (const directusProduct of directusProducts) {
      if (!medusaProductTitles.has(directusProduct.product_name)) {
        console.log(`Syncing new product: ${directusProduct.product_name}`);

        const productPayload = {
          title: directusProduct.product_name,
          description: directusProduct.description || "No description provided.",
          handle: directusProduct.product_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
          .replace(/^-+|-+$/g, ""), // Remove leading/trailing hyphens
          status: "published",
          is_giftcard: false,
          options: [
            {
              title: "Default Option",
              values: ["Default Value"],
            },
          ],
          variants: [
            {
              title: `${directusProduct.product_name} Variant`,
              manage_inventory: false,
              allow_backorder: false,
              prices: [
                {
                  currency_code: "usd",
                  amount: Math.round(Number(directusProduct.price) * 100),
                },
              ],
            },
          ],
        };

        try {
          const response = await medusa.post('/admin/products', productPayload);
          console.log('Product synced to Medusa:', response.data);
        } catch (syncError) {
          console.error('Error syncing product to Medusa:', syncError.response?.data || syncError.message);
        }
      } else {
        console.log('All products are synced to medusa');
      }
    }
  } catch (error) {
    console.error('Error during synchronization:', error.message);
  }
}

// Function to simulate real-time event handling
async function listenForDirectusChanges() {
  try {
    const response = async () => {
      try {
        // Fetch all products from Directus
        const result = await client.request(readItems('weframe_products'));

        // Sync only new products
        await syncNewProductsToMedusa(result);
      } catch (error) {
        console.error('Error fetching Directus products:', error.message);
      }
    };

    response(); // Initial fetch and sync
    // setInterval(response, 5000); // Poll every 5 seconds
    console.log('Started polling for Directus changes...');
  } catch (error) {
    console.error('Error in polling for Directus collection:', error.message);
  }
}

// Initialize Synchronization
(async () => {
  try {
    console.log('Initializing synchronization...');
    await listenForDirectusChanges();
  } catch (error) {
    console.error('Error initializing synchronization:', error.message);
  }
})();