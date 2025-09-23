import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default {
  plugins: [
    tailwindcss(),
    viteSingleFile()
  ]
};
