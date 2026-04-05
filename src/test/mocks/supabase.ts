export const mockSupabaseStorage = {
  from: vi.fn(() => ({
    upload: vi.fn().mockResolvedValue({ data: { path: 'test/uuid.jpg' }, error: null }),
    createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://supabase.example.com/storage/v1/test' }, error: null }),
  })),
}

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: [{ id: 'invoice-1' }], error: null }),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'invoice-1' }, error: null }),
  })),
  storage: mockSupabaseStorage,
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
  },
}

vi.mock('../../lib/supabase', () => ({ supabase: mockSupabase }))
