export const getBasePath = (): string => {
  const hostname = window.location.hostname;
  
  // GitHub Pages - нужен префикс /morokkka/
  if (hostname.includes('github.io')) {
    return '/morokkka';
  }
  
  // onreza.app и localhost - без префикса
  return '';
};

export const getImagePath = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${cleanPath}`;
};