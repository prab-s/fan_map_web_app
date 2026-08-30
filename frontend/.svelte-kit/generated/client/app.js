export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/bulk-actions": [3],
		"/bulk-import": [4],
		"/catalogue": [5],
		"/cms-experimental": [7],
		"/cms": [6],
		"/editor": [8],
		"/editor/create": [9],
		"/editor/edit": [10],
		"/editor/edit/[product]": [11],
		"/editor/product-types": [12],
		"/editor/product-types/create": [13],
		"/editor/product-types/edit": [14],
		"/editor/product-types/edit/[product_type]": [15],
		"/editor/quote-requests": [16],
		"/editor/series": [17],
		"/editor/series/create": [18],
		"/editor/series/edit": [19],
		"/editor/series/edit/[series]": [20],
		"/enquiries": [21],
		"/entry": [22],
		"/map": [23],
		"/products": [24],
		"/products/type/[product_type]": [26],
		"/products/[product]": [25],
		"/quotes": [27],
		"/series/[series]": [28],
		"/setup": [29],
		"/template-builder-v2": [31],
		"/template-builder": [30],
		"/viewer": [32],
		"/viewer/[tab]/[[record]]": [33]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';