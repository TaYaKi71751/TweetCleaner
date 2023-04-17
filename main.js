const authorization = 'Bearer <Bearer-Token>'; // Bearer Token from (Firefox) "More tools" > "Web Developer Tools" > "Network" on twitter.com

let mainURL = '';
let main;
let mainJS = '';

function getSelfScreenName () {
	return (new URL(document.querySelector('a[data-testid=AppTabBar_Profile_Link]').href)).pathname.substring(1);
}

async function getQueryId (name) {
	mainURL = document.querySelector('script[src*="/main."][src*=".js"]').src;
	main = await fetch(mainURL);
	mainJS = await main.text();
	const max = `${mainJS}`.indexOf(`"${name}"`);
	const min = `${mainJS}`.lastIndexOf('e.exports=', max);
	const qs = 'queryId';
	const qmin = `${mainJS}`.indexOf(qs, min) + qs.length;
	const qvstart = `${mainJS}`.indexOf('"', qmin) + 1;
	const qvend = `${mainJS}`.indexOf('"', qvstart + 1) - 1;
	return `${mainJS}`.substring(qvstart, qvend + 1);
}
async function SearchTweet (params) {
	let sp = {
		include_profile_interstitial_type: 1,
		include_blocking: 1,
		include_blocked_by: 1,
		include_followed_by: 1,
		include_want_retweets: 1,
		include_mute_edge: 1,
		include_can_dm: 1,
		include_can_media_tag: 1,
		include_ext_has_nft_avatar: 1,
		include_ext_is_blue_verified: 1,
		include_ext_verified_type: 1,
		include_ext_profile_image_shape: 1,
		skip_status: 1,
		cards_platform: 'Web-12',
		include_cards: 1,
		include_ext_alt_text: true,
		include_ext_limited_action_results: false,
		include_quote_count: true,
		include_reply_count: 1,
		tweet_mode: 'extended',
		include_ext_views: true,
		include_entities: true,
		include_user_entities: true,
		include_ext_media_color: true,
		include_ext_media_availability: true,
		include_ext_sensitive_media_warning: true,
		include_ext_trusted_friends_metadata: true,
		send_error_codes: true,
		simple_quoted_tweet: true,
		q: '', // search_text
		query_source: 'recent_search_click',
		count: 20,
		requestContext: 'launch',
		pc: 1,
		spelling_corrections: 1,
		include_ext_edit_control: true,
		ext: 'mediaStats,highlightedLabel,hasNftAvatar,voiceInfo,birdwatchPivot,enrichments,superFollowMetadata,unmentionInfo,editControl,vibe'
	};
	sp = Object.assign(sp, params);
	const s = Object.entries(sp).map(([k, v]) => `${k}=${v}`).join('&');
	return fetch('https://twitter.com/i/api/2/search/adaptive.json' + `?${s}`, {
		credentials: 'include',
		headers: {
			Accept: '*/*',
			'Accept-Language': 'en-US,en;q=0.5',
			'x-twitter-auth-type': 'OAuth2Session',
			'x-csrf-token': (document.cookie.split('; ').filter((c) => c.split('=')[0] == 'ct0'))[0].split('=')[1],
			'x-twitter-client-language': (document.cookie.split('; ').filter((c) => c.split('=')[0] == 'lang'))[0].split('=')[1],
			'x-twitter-active-user': 'yes',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-origin',
			authorization,
			Pragma: 'no-cache',
			'Cache-Control': 'no-cache'
		},
		referrer: `https://twitter.com/search?q=${sp?.q}&src=recent_search_click`,
		method: 'GET',
		mode: 'cors'
	});
}
async function DeleteTweet (tweetId) {
	const queryName = 'DeleteTweet';
	const queryId = await getQueryId(queryName);
	return fetch(`https://twitter.com/i/api/graphql/${queryId}/${queryName}`, {
		credentials: 'include',
		headers: {
			Accept: '*/*',
			'Accept-Language': 'en-US,en;q=0.5',
			'Content-Type': 'application/json',
			'x-twitter-auth-type': 'OAuth2Session',
			'x-csrf-token': (document.cookie.split('; ').filter((c) => c.split('=')[0] == 'ct0'))[0].split('=')[1],
			'x-twitter-client-language': (document.cookie.split('; ').filter((c) => c.split('=')[0] == 'lang'))[0].split('=')[1],
			'x-twitter-active-user': 'yes',
			authorization,
			Pragma: 'no-cache',
			'Cache-Control': 'no-cache'
		},
		referrer: document.location.href,
		body: JSON.stringify({
			variables: {
				tweet_id: tweetId,
				dark_request: false
			},
			queryId
		}),
		method: 'POST',
		mode: 'cors'
	});
}

async function SearchAllTweet () {
	const ScreenName = getSelfScreenName();
	const res = await SearchTweet({ q: `from:${ScreenName}` });
	const searchRes = await res?.json();
	const { globalObjects } = Object.assign({}, searchRes);
	const { users, tweets } = Object.assign({}, globalObjects);
	const current_user_id = Object.entries(users).filter(([user_id, user_object]) => user_object.screen_name == ScreenName).map(([user_id]) => user_id)[0];
	const current_tweet_ids = Object.entries(tweets).filter(([tweet_id, tweet_object]) => tweet_object.user_id_str).map(([tweet_id]) => tweet_id);
	return current_tweet_ids;
}
SearchAllTweet().then(async (ta) => {
	const ScreenName = getSelfScreenName();
	for (const t of ta) {
		console.log(`https://twitter.com/${ScreenName}/status/${t}`);
		//     await DeleteTweet(t)
		const res = await fetch(`${ScreenName}/status/${t}`);
		const text = await res.text();
		console.log(text);
	}
});
