import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from 'path';

export default {
    plugins: [
        tailwindcss(),
        viteSingleFile()
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'example/web/index.html'),
            }
        }
    }
};
