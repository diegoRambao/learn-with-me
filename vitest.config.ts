import { getViteConfig } from 'astro/config';

const testConfig = {
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
};

export default getViteConfig(testConfig as Parameters<typeof getViteConfig>[0]);
