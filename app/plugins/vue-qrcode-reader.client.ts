/**
 * vue-qrcode-reader depends on zxing-wasm, which fetches a .wasm file at runtime.
 * Our CSP blocks external requests, so we serve the wasm from /public/wasm instead.
 */
import { setZXingModuleOverrides } from 'vue-qrcode-reader';

export default defineNuxtPlugin(() => {
  setZXingModuleOverrides({
    locateFile: (path) => {
      if (path.endsWith('zxing_reader.wasm')) {
        return '/wasm/zxing_reader.wasm';
      }

      return `/wasm/${path}`;
    },
  });
});
