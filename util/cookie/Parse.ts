import { Cookie } from '../type';

export function parseCookie ({
	name,
	value
}: Cookie): Cookie {
	return {
		name,
		value
	};
}
