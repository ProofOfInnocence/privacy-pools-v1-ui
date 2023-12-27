/* tslint:disable */
/* eslint-disable */
/**
* @param {string} path
* @param {string} base
* @returns {Promise<string>}
*/
export function read_filem(path: string, base: string): Promise<string>;
/**
* @param {string} path
* @param {string} base
* @returns {Promise<Uint8Array>}
*/
export function read_filen(path: string, base: string): Promise<Uint8Array>;
/**
*/
export function init_panic_hook(): void;
/**
* @param {number} mode
* @param {string} r1cs_or_json_or_cbor_or_binc_path
* @param {string} base
* @returns {Promise<string>}
*/
export function generate_params(mode: number, r1cs_or_json_or_cbor_or_binc_path: string, base: string): Promise<string>;
/**
* @param {string} url
* @param {string} filename
* @returns {string}
*/
export function get_path(url: string, filename: string): string;
/**
* @param {string} pp_str
* @param {string} r1cs_path
* @param {string} wasm_path
* @param {number} mode
* @param {string} input_path_or_str
* @param {string} start_path_or_str
* @param {string} base
* @returns {Promise<string>}
*/
export function generate_proof(pp_str: string, r1cs_path: string, wasm_path: string, mode: number, input_path_or_str: string, start_path_or_str: string, base: string): Promise<string>;
/**
* @param {string} pp_str
* @param {string} proof_str
* @param {number} mode
* @param {string} start_path_or_str
* @param {string} base
* @returns {Promise<boolean>}
*/
export function verify_compressed_proof(pp_str: string, proof_str: string, mode: number, start_path_or_str: string, base: string): Promise<boolean>;
/**
* @param {string} path
* @returns {Promise<Uint8Array>}
*/
export function read_file(path: string): Promise<Uint8Array>;
/**
* @param {string} input_json_string
* @param {string} wasm_file
* @returns {Promise<Uint8Array>}
*/
export function generate_witness_browser(input_json_string: string, wasm_file: string): Promise<Uint8Array>;
/**
* @param {number} num_threads
* @returns {Promise<any>}
*/
export function initThreadPool(num_threads: number): Promise<any>;
/**
* @param {number} receiver
*/
export function wbg_rayon_start_worker(receiver: number): void;
/**
*/
export class wbg_rayon_PoolBuilder {
  free(): void;
/**
* @returns {number}
*/
  numThreads(): number;
/**
* @returns {number}
*/
  receiver(): number;
/**
*/
  build(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly read_filem: (a: number, b: number, c: number, d: number) => number;
  readonly read_filen: (a: number, b: number, c: number, d: number) => number;
  readonly generate_params: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly get_path: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly generate_proof: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => number;
  readonly verify_compressed_proof: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
  readonly init_panic_hook: () => void;
  readonly __wbg_wbg_rayon_poolbuilder_free: (a: number) => void;
  readonly wbg_rayon_poolbuilder_numThreads: (a: number) => number;
  readonly wbg_rayon_poolbuilder_receiver: (a: number) => number;
  readonly wbg_rayon_poolbuilder_build: (a: number) => void;
  readonly wbg_rayon_start_worker: (a: number) => void;
  readonly initThreadPool: (a: number) => number;
  readonly read_file: (a: number, b: number) => number;
  readonly generate_witness_browser: (a: number, b: number, c: number, d: number) => number;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h258cc74006aa23c6: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h3960e0d0fff8d810: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_thread_destroy: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput, maybe_memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>, maybe_memory?: WebAssembly.Memory): Promise<InitOutput>;
