import { getEnv } from '../Env';
import {
	resolve,
	join
} from 'path';
import {
	readdirSync
} from 'fs';
const HOME: string = getEnv('HOME');
const firefoxPrefix: string = (function () {
	return resolve(join(HOME, '.mozilla/firefox/'));
})();

export function getCookiePath () {
	const paths = readdirSync(firefoxPrefix);
	const devEditionDefaultPath = (function (): string {
        type name = string;
        type path = string;
        const dir: name = paths.filter((_) => (_.includes('dev-edition')))[0];
        const full: path = resolve(join(firefoxPrefix, dir));
        return full;
	})();
	return `${devEditionDefaultPath}/cookies.sqlite`;
}
