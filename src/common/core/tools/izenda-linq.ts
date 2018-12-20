declare global {

	type Predicate<T> = (arg: T) => boolean;

	interface Array<T> {
		/**
		 * LINQ FirstOrDefault method analog.
		 * @param predicate Search predicate.
		 * @returns {T | null} Returns first found value or null.
		 */
		firstOrDefault(predicate: Predicate<T>): T;

		/**
		 * Append collection
		 * @param collection
		 */
		pushAll(collection: Array<T>): Array<T>;

		/**
		 * Find first occurence in array's nested objects.
		 * I.e. for array:
		 * const a = [ {a:1, b:['a','b']}, {a:100, b:['aaa', 'd']}, {a:1000, b:['e','aaaa']} ];
		 * a.firstOrDefaultInInner('b', bItem => bItem.indexOf('a') >= 0);
		 * will return first value from .b arrays with substring 'a'.
		 * @param innerObjectKey Inner collection property name.
		 * @param innerObjectPredicate Predicate for search across inner collections.
		 */
		firstOrDefaultInInner<K extends keyof T>(innerObjectKey: K, innerObjectPredicate: Predicate<T[K]>): T[K];

		/**
		 * Find all occurences in array's nested objects.
		 * I.e. for array:
		 * const a = [ {a:1, b:['a','b']}, {a:100, b:['aaa', 'd']}, {a:1000, b:['e','aaaa']} ];
		 * a.filterInInner('b', bItem => bItem.indexOf('a') >= 0);
		 * will return all values from .b arrays with substring 'a': ['a', 'aaa', 'aaaa'].
		 * @param innerObjectKey Inner collection property name.
		 * @param innerObjectPredicate Predicate for search across inner collections.
		 */
		filterInInner<K extends keyof T>(innerObjectKey: K, innerObjectPredicate: Predicate<T[K]>): Array<T[K]>;
	}
}

export module IzendaLinq {

	Array.prototype.firstOrDefault = function <T>(predicate: Predicate<T>): T {
		return this.reduce((accumulator: T, currentValue: T) => {
			if(!accumulator && predicate(currentValue)) 
				accumulator = currentValue;
			return accumulator;
		}, null);
	}

	Array.prototype.pushAll = function<T>(collection: Array<T>): Array<T> {
		if (collection === null)
			return this;
		collection.forEach(t => this.push(t));
		return this;
	}

	Array.prototype.firstOrDefaultInInner = function<T, K extends keyof T>(innerObjectKey: K,
		innerObjectPredicate: Predicate<T[K]>): T[K] | null {

		for (let i = 0; i < this.length; i++) {
			const parentObject = this[i] as T;
			if (!parentObject.hasOwnProperty(innerObjectKey))
				throw `Key ${innerObjectKey} not found in object ${parentObject}`;

			const innerObject = parentObject[innerObjectKey];
			if (innerObject && innerObject instanceof Array) {
				const foundInner = innerObject.firstOrDefault(innerObjectPredicate);
				if (foundInner)
					return foundInner;
			}
		}
		return null;
	}

	Array.prototype.filterInInner = function<T, K extends keyof T>(innerObjectKey: K,
		innerObjectPredicate: Predicate<T[K]>): Array<T[K]> {

		return this.reduce((result: Array<T[K]>, currentTopLevel: T) => {
			if (!currentTopLevel.hasOwnProperty(innerObjectKey))
				throw `Key ${innerObjectKey} not found in object ${currentTopLevel}`;
			const inner = currentTopLevel[innerObjectKey];
			if (inner && inner instanceof Array)
				return result.concat(inner.filter(innerObjectPredicate));
			return result;
		}, []);
	};
}
