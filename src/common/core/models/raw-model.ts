/**
 * This interface used for the convertation from/to server-side json objects.
 * Object with this interface are used as the promise parameters for query methods.
 */
export interface IIzendaRawModel {

	/**
	 * Convert raw json (or any other type) into the raw model object.
	 * @param {any} json Source raw object.
	 */
	fromJson(json: any, ...optional);

	/**
	 * Convert this object into the raw format.
	 * @returns {any} Raw object.
	 */
	toJson(): any;
}