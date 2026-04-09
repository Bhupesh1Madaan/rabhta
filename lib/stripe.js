import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
});

export default stripe;

export async function createCheckoutSession({ orderId, items, successUrl, cancelUrl }) {
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: `${item.name} (${item.size} / ${item.color})`,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { orderId },
  });

  return session;
}
