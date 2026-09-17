import { recoverFileTransactions } from './file-transaction';

export type MutationCoordinator = Readonly<{
  initialize(): Promise<void>;
  run<T>(mutation: () => Promise<T>): Promise<T>;
}>;

const coordinators = new Map<string, MutationCoordinator>();

export const createMutationCoordinator = (repositoryRoot: string): MutationCoordinator => {
  let tail = Promise.resolve<unknown>(undefined);
  let initialization: Promise<void> | undefined;
  const initialize = (): Promise<void> => {
    initialization ??= recoverFileTransactions(repositoryRoot);
    return initialization;
  };
  return {
    initialize,
    run: async <T>(mutation: () => Promise<T>): Promise<T> => {
      await initialize();
      const result = tail.then(mutation, mutation);
      tail = result.then(() => undefined, () => undefined);
      return result;
    },
  };
};

export const mutationCoordinatorFor = (repositoryRoot: string): MutationCoordinator => {
  const current = coordinators.get(repositoryRoot);
  if (current) return current;
  const coordinator = createMutationCoordinator(repositoryRoot);
  coordinators.set(repositoryRoot, coordinator);
  return coordinator;
};
