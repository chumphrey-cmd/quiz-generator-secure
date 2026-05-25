// import tailwindcss from '@tailwindcss/vite'; // import if using tailwindcss v4+
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
    // 1. DEVELOPMENT SERVER CONFIGURATION
    server: {
        port: 3000, // Forces the dev server to run on localhost:3000
        strictPort: true, // Fails if port 3000 is taken, rather than randomly assigning another port
        hmr: {
            clientPort: 3000, // Ensures Hot Module Replacement (live reloading) points to the correct port
        },
        proxy: {
            // Intercepts API calls starting with '/api' and routes them to your backend server
            '/api': {
                target: 'http://localhost:8080', // Your backend URL
                changeOrigin: true, // Changes the origin of the host header to the target URL
            },
        },
    },

    // 2. VITE PLUGINS
    plugins: [
        react(), // Enables React support, JSX compilation, and Fast Refresh
        // tailwindcss(), // Integrates Tailwind CSS v4 directly into the Vite build process
    ],

    // 3. BUILD CONFIGURATION
    build: {
        outDir: 'build', // Changes the default output folder for production builds from 'dist' to 'build'
    },

    // 4. TEST CONFIGURATION (VITEST)
    test: {
        globals: true, // Injects describe, it, expect, vi into the global scope so you don't need to import them
        environment: 'jsdom', // Simulates a browser DOM so React Testing Library can render components
        setupFiles: './tests/setupTest.js', // Runs this file before tests execute (used to load jest-dom matchers)
        css: false, // Disables CSS processing during tests to significantly speed up execution time
    },
});