import { Request, Response } from 'express';
import Stripe from 'stripe';
import { adminDb } from '../config/firebase';
import { AuthRequest } from '../middlewares/authMiddleware';

// ❌ شيلنا apiVersion خالص
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MedPrep Premium Plan',
              description: 'Access to all premium medical questions and explanations.',
            },
            unit_amount: 1999, // $19.99
            recurring: {
              interval: 'month',
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?success=true`,
      cancel_url: `${req.headers.origin}/dashboard?canceled=true`,
      metadata: {
        userId: uid,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const webhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (!sig || !webhookSecret) {
      res.status(400).send('Missing signature or webhook secret');
      return;
    }
    
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    if (userId) {
      try {
        await adminDb.collection('users').doc(userId).update({
          plan: 'premium',
          stripeCustomerId: session.customer as string,
        });
        console.log(`Successfully upgraded user ${userId} to premium.`);
      } catch (err) {
        console.error('Error updating user plan:', err);
      }
    }
  }

  res.status(200).send();
};

export const createCustomerPortalSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData || !userData.stripeCustomerId) {
      res.status(400).json({ error: 'No active subscription found.' });
      return;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${req.headers.origin}/dashboard`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
};