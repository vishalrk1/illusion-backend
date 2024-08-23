import { Cart } from "@models/Cart";
import Product from "@models/Product";

export async function calculateCartTotal(cart: Cart) {
  let total = 0;
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (product) {
      total += product.price * Number(item.quantity);
    }
  }
  return total;
}
