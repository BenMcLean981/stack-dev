import { getCurrentPackage, getWorkspaceRoot } from './utils/utils';

export async function linkPackages(target: string) {
  const root = await getWorkspaceRoot();

  const currentPackage = await getCurrentPackage();
}
