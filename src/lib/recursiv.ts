import 'server-only';
import { Recursiv } from '@recursiv/sdk';

let _instance: Recursiv | null = null;

export function getSdk(): Recursiv {
  if (!_instance) {
    _instance = new Recursiv({ apiKey: process.env.RECURSIV_API_KEY });
  }
  return _instance;
}
