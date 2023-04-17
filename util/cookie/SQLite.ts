import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import {
	Json,
	DBPath,
	DBSelect
} from '../type';

function getTypeOfJson (w: any) {
	return typeof JSON.parse(JSON.stringify(w));
}

function getWhereFromJson (where: Json): string {
	if (typeof where === 'string') {
		throw new Error();
	}
	return Object.entries(where).map(([k, v]): string => {
		return ` WHERE ${k} = '${v}' `;
	}).join('');
}

function getWhere ({
	where
}: DBSelect): string {
	const whereType = getTypeOfJson(where);
	switch (whereType) {
	case 'object': return (function (w) {
		const _w = JSON.parse(JSON.stringify(w));
		return getWhereFromJson(_w);
	})(where);
	case 'string': return `${where}`;
	default: throw new Error();
	}
}

export async function openDB ({ path }: DBPath) {
	const db = await open({
		filename: `${path}`,
		mode: sqlite3.OPEN_READWRITE,
		driver: sqlite3.Database
	});
	return db;
}

export async function select (db: any, {
	select,
	from,
	filter
}: DBSelect) {
	const cmd = (function () {
		const __select = ` SELECT ${select || '*'} `;
		const __from = ` FROM ${from || '*'} `;
		return __select + __from;
	})().trim();
	let result: any = await db.all(cmd);
	if (filter) {
		result = result.filter((_: any) => filter(_));
	}
	return result;
}

export async function update (db: any, {
	table,
	set,
	where
}: DBSelect) {
	const cmd = (function () {
		const __table = table;
		const __set: any = Object.entries(set ?? { '': '' }).map(([k, v]): string => {
			return ` SET ${k} = '${v}' `;
		}).join('');
		const __where = getWhere({ where });
		return 'UPDATE ' + __table + __set + __where;
	})().trim();
	await db.run(cmd);
}