export async function hashPin(pin:string){const data=new TextEncoder().encode(pin);const digest=await crypto.subtle.digest('SHA-256',data);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('')}
export function getPinHash(){return localStorage.getItem('sf-pin-hash')||''}
export function setPinHash(hash:string){if(hash)localStorage.setItem('sf-pin-hash',hash);else localStorage.removeItem('sf-pin-hash')}
