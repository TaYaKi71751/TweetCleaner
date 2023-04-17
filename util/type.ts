export type Cookie = {
	name: string;
	value: string;
	host?: string;
	domain?: string;
}

export type CookiesParam = {
	cookies?: Array<Cookie>;
	filter?: Function;
}

export type Env = string;

export type Json = {
	[x: string]: string | Json | number | bigint;
}

export type DBSelect = {
	select?: string;
	set?: Json;
	table?: string;
	from?: string;
	where?: Json | string;
	filter?: Function;
}

export type Path = {
	path?: string;
}

export { Path as DBPath };
