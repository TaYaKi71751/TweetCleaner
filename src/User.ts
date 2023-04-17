/* Get ScreenName from https://twitter.com/home */
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { getCookies } from '../util/Cookie';
import { Cookie } from '../util/type';

let home:any;
let homeHTML = '';
let homeDocument:any;

let userScript = '';
let window:any = {};
let user:any;

export async function getCurrentUserObject () {
	const cookies = await getCookies({});
	if (!home) {
		home = await fetch('https://twitter.com/home', {
			headers: {
				cookie: cookies.map((c:Cookie) => `${c.name}=${c.value}`).join('; ')
			}
		});
		homeHTML = await home.text();
	}
	if (homeHTML && !user) {
		homeDocument = cheerio.load(homeHTML);
		userScript = homeDocument('script:not([src])').prop('innerHTML');
		window = Function(`var window = {};${
			homeDocument('script:not([src])')
				.filter((e:any, j:any) => j?.firstChild?.data?.includes('window.__INITIAL_STATE__='))[0]
				.firstChild.data} return window;`)();
	}
	const current_user_id = `${window?.__INITIAL_STATE__?.session?.user_id}`;
	user = window?.__INITIAL_STATE__?.entities.users.entities[current_user_id];
	return user;
}

getCurrentUserObject()
	.then((e) => {
		console.log(e);
	});
