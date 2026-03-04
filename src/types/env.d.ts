// Type declarations for missing Stripe modules and Vite env

// Stripe types removed — using PayFast demo. Keep only Vite env declarations.

// Extend ImportMeta to include Vite env var
interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_PAYFAST_MERCHANT_ID?: string;
  readonly VITE_PAYFAST_MERCHANT_KEY?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
