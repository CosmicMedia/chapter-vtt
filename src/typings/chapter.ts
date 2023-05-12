/**
 * A chapter definition
 */
export interface Chapter {
	/**
	 * Name of the chapter as defined after the timestamp (00:01 Chapter Name)
	 */
	name: string;
	/**
	 * Value of the timestamp (00:01) in seconds
	 */
	seconds: number;
	/**
	 * The timestamp value (00:01)
	 */
	timestamp: string;
}
