const axios = require("axios");

require('dotenv').config();


// Initialize Medusa client
const medusa = axios.create({
  baseURL: process.env.MEDUSA_URL,
  headers: {
    Authorization: `Bearer ${process.env.MEDUSA_API_KEY}`,
  },
});
console.log('asdas')

module.exports = function registerHook({ action }) {
	console.log(action)
  // Handle Create Event
  action("items.create.weframe_products", async ({ payload }) => {
    try {
      const productPayload = {
        title: payload.product_name,
        description: payload.description || "No description provided.",
        status: "published",
        is_giftcard: false,
        options: [],
        variants: [
          {
            title: "Default Variant",
            manage_inventory: false,
            allow_backorder: false,
            prices: [
              {
                currency_code: "usd",
                amount: Math.round(payload.price * 100),
              },
            ],
          },
        ],
      };

      const response = await medusa.post("/admin/products", productPayload);
      console.log("Product created in Medusa:", response.data);
    } catch (error) {
      console.error("Error creating product in Medusa:", error.response?.data || error.message);
    }
  });

  // Handle Update Event
  action("items.update.weframe_products", async ({ payload, keys }) => {
    try {
      const productId = keys[0]; // Assuming a single item update
      const productPayload = {
        title: payload.product_name,
        description: payload.description || "No description provided.",
      };

      const response = await medusa.put(`/admin/products/${productId}`, productPayload);
      console.log("Product updated in Medusa:", response.data);
    } catch (error) {
      console.error("Error updating product in Medusa:", error.response?.data || error.message);
    }
  });

  // Handle Delete Event
  action("items.delete.weframe_products", async ({ keys }) => {
    try {
      const productId = keys[0]; // Assuming a single item delete
      const response = await medusa.delete(`/admin/products/${productId}`);
      console.log("Product deleted in Medusa:", response.data);
    } catch (error) {
      console.error("Error deleting product from Medusa:", error.response?.data || error.message);
    }
  });
};
