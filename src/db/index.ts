// Placeholder db module - replace with actual Drizzle/Supabase connection
export const db = {
  select: () => ({
    from: (_table: any) => ({
      where: (_cond: any) => ({ limit: (_n: number) => Promise.resolve([]) }),
      limit: (_n: number) => Promise.resolve([]),
    }),
  }),
} as any;
