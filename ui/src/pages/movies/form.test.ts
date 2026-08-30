import { describe, expect, it } from 'vitest';
import { MovieSchema } from './form';

describe('MovieSchema', () => {
  it('accepts a valid name', () => {
    expect(MovieSchema.safeParse({ name: 'Interstellar' }).success).toBe(true);
  });

  it('accepts an optional id', () => {
    expect(MovieSchema.safeParse({ name: 'Dune', id: 42 }).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(MovieSchema.safeParse({ name: 'A' }).success).toBe(false);
  });

  it('rejects a name longer than 50 characters', () => {
    expect(MovieSchema.safeParse({ name: 'A'.repeat(51) }).success).toBe(false);
  });

  it('rejects a missing name', () => {
    expect(MovieSchema.safeParse({}).success).toBe(false);
  });
});
