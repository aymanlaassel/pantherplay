// The real Supabase client can't load in Jest (no native storage, no env vars in CI).
// Every test gets this stand-in; a call nobody mocked fails loudly instead of reaching the network.
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(async (fn: string) => ({ data: null, error: { message: `supabase.rpc('${fn}') is not mocked in this test` } })),
  },
}));
