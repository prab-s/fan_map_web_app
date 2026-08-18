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
	() => import('./nodes/31')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/bulk-actions": [3],
		"/bulk-import": [4],
		"/catalogue": [5],
		"/editor": [6],
		"/editor/create": [7],
		"/editor/edit": [8],
		"/editor/edit/[product]": [9],
		"/editor/product-types": [10],
		"/editor/product-types/create": [11],
		"/editor/product-types/edit": [12],
		"/editor/product-types/edit/[product_type]": [13],
		"/editor/quote-requests": [14],
		"/editor/series": [15],
		"/editor/series/create": [16],
		"/editor/series/edit": [17],
		"/editor/series/edit/[series]": [18],
		"/enquiries": [19],
		"/entry": [20],
		"/map": [21],
		"/products": [22],
		"/products/type/[product_type]": [24],
		"/products/[product]": [23],
		"/quotes": [25],
		"/series/[series]": [26],
		"/setup": [27],
		"/template-builder-v2": [29],
		"/template-builder": [28],
		"/viewer": [30],
		"/viewer/[tab]/[[record]]": [31]
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