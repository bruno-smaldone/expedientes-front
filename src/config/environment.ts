interface Config {
  apiBaseUrl: string;
  apiKey?: string;
}

const isDevelopment = import.meta.env.DEV;

const config: Config = {
  apiBaseUrl: isDevelopment 
    ? 'http://localhost:3000' 
    : 'https://api.cicero.uy',
  apiKey: import.meta.env.VITE_API_KEY || undefined,
};

export default config;