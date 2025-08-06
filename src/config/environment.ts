interface Config {
  apiBaseUrl: string;
  apiKey?: string;
}

const isDevelopment = import.meta.env.DEV;

const config: Config = {
  apiBaseUrl: isDevelopment 
    ? 'http://localhost:3000' 
    : 'https://0e364rnxsc.execute-api.us-east-1.amazonaws.com/Prod',
  apiKey: import.meta.env.VITE_API_KEY || undefined,
};

export default config;