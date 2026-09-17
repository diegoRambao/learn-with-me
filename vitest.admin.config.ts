import { getViteConfig } from 'astro/config';

const config = {
  test: {
    environment: 'node',
    include: [
      'tests/unit/admin/**/*.test.ts',
      'tests/integration/admin/**/*.test.ts',
    ],
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
};

export default getViteConfig(config as Parameters<typeof getViteConfig>[0]);
