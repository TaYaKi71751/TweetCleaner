import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { getCookies } from '../util/Cookie';
import { Cookie } from '../util/type';

let home:any;
let homeHTML = '';
let homeDocument:any;

let mainURL = '';
let main:any;
let mainJS = '';

export async function getQueryId (name:string) {
	const cookies = await getCookies({});
	if (!home) {
		home = await fetch('https://twitter.com/home', {
			headers: {
				Cookie: cookies.map((c:Cookie) => `${c.name}=${c.value}`).join('; ')
			}
		});
		homeHTML = await home.text();
	}
	if (homeHTML && !mainJS) {
		if (!homeDocument) homeDocument = cheerio.load(homeHTML);
		mainURL = homeDocument('script[src*=/main.][src*=.js]').prop('src');
		main = await fetch(mainURL);
		mainJS = await main.text();
	}

	const max = `${mainJS}`.indexOf(`"${name}"`);
	const min = `${mainJS}`.lastIndexOf('e.exports=', max);
	const qs = 'queryId';
	const qmin = `${mainJS}`.indexOf(qs, min) + qs.length;
	const qvstart = `${mainJS}`.indexOf('"', qmin) + 1;
	const qvend = `${mainJS}`.indexOf('"', qvstart + 1) - 1;
	return `${mainJS}`.substring(qvstart, qvend + 1);
}

// getQueryId('CreateTweet')
// 	.then((e) => {
// 		console.log(e);
// 	});
