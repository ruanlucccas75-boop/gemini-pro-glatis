export interface AppUpdate {
  version: string;
  releaseDate: string;
  title: string;
  description: string;
  features: string[];
  sizeMb: string;
}

export const BASE_VERSION = 'v2.4.2';
export const NEXT_VERSION = 'v2.5.0';

export const LATEST_UPDATE: AppUpdate = {
  version: NEXT_VERSION,
  releaseDate: 'Hoje',
  title: 'Astra Next-Gen v2.5.0',
  description: 'Nova versão da Astra com respostas 2x mais rápidas, raciocínio em profundidade aprimorado e pesquisa web em tempo real.',
  features: [
    'Astra 3.8 Turbo: Respostas mais rápidas e menor latência',
    'Raciocínio Lógico (Thinking): Análise aprofundada passo a passo',
    'Pesquisa na Web aperfeiçoada com fontes e links atualizados',
    'Seletor de IA com rolagem inteligente e 5 modelos disponíveis',
    'Login individual seguro sem compartilhar contas entre usuários',
    'Atualização inteligente direta dentro do próprio aplicativo',
  ],
  sizeMb: '4.8 MB',
};

const STORAGE_VERSION_KEY = 'astra_installed_version_v1';
const STORAGE_DISMISSED_KEY = 'astra_update_dismissed_v1';

export function getInstalledVersion(): string {
  try {
    return localStorage.getItem(STORAGE_VERSION_KEY) || BASE_VERSION;
  } catch {
    return BASE_VERSION;
  }
}

export function setInstalledVersion(v: string): void {
  try {
    localStorage.setItem(STORAGE_VERSION_KEY, v);
    localStorage.removeItem(STORAGE_DISMISSED_KEY);
  } catch (e) {
    console.error('Failed to save version:', e);
  }
}

export function isUpdateAvailable(): boolean {
  const current = getInstalledVersion();
  return current !== NEXT_VERSION;
}

export function isUpdateDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_DISMISSED_KEY) === NEXT_VERSION;
  } catch {
    return false;
  }
}

export function dismissUpdate(): void {
  try {
    localStorage.setItem(STORAGE_DISMISSED_KEY, NEXT_VERSION);
  } catch (e) {
    console.error('Failed to dismiss update:', e);
  }
}

export function resetUpdateForDemo(): void {
  try {
    localStorage.setItem(STORAGE_VERSION_KEY, BASE_VERSION);
    localStorage.removeItem(STORAGE_DISMISSED_KEY);
  } catch (e) {
    console.error('Failed to reset update:', e);
  }
}
