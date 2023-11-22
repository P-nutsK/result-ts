import * as fsp from "node:fs/promises"

/* eslint-disable no-empty */
export class Ok<T> {
	error = null;
	value: T;
	constructor(value: T) {
		this.value = value;
	}
	unwrap(): T {
		return this.value;
	}
}

export class Err<T> {
	error: T;
	value = null;
	constructor(error: T) {
		this.error = error;
	}
	/**
	 * 失敗したらエラーをthrowします。  
	 * そのまま異常終了するもよし、try...catchを使用して疑問符演算子のように使えるかも
	 * ```js
	 * try {
	 *		const result = m.fetch().unwrap();
	 * } catch (error) {
	 * 	return new Err(error);
	 * }
	 * ```
	 */
	unwrap(): never {
		throw this.error;
	}
}
export type Result<T, U> = Ok<T> | Err<U>;
/**
 * Promiseを返す関数を、Result型として使うことができます
 * @param func result型として使用したい関数
 * ```ts
 * const resultedFetch = resultify(fetch);
 * const { error,value:response } = await resultedFetch("//example.com")
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resultify<T extends (...args: any[]) => Promise<any>>(
	func: T
): (...args: Parameters<T>) => Promise<Result<Awaited<ReturnType<T>>, unknown>> {
	return async (...args: Parameters<T>) => {
		try {
			const ok = await func(...args);
			return new Ok(ok)
		} catch (err) {
			return new Err(err)
		}
	};
}
const read = resultify(fsp.readFile);
(await read("/")).unwrap()