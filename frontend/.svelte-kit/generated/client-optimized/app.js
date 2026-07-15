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
	() => import('./nodes/30')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/bulk-import": [3],
		"/catalogue": [4],
		"/editor": [5],
		"/editor/create": [6],
		"/editor/edit": [7],
		"/editor/edit/[product]": [8],
		"/editor/product-types": [9],
		"/editor/product-types/create": [10],
		"/editor/product-types/edit": [11],
		"/editor/product-types/edit/[product_type]": [12],
		"/editor/quote-requests": [13],
		"/editor/series": [14],
		"/editor/series/create": [15],
		"/editor/series/edit": [16],
		"/editor/series/edit/[series]": [17],
		"/enquiries": [18],
		"/entry": [19],
		"/map": [20],
		"/products": [21],
		"/products/type/[product_type]": [23],
		"/products/[product]": [22],
		"/quotes": [24],
		"/series/[series]": [25],
		"/setup": [26],
		"/template-builder-v2": [28],
		"/template-builder": [27],
		"/viewer": [29],
		"/viewer/[tab]/[[record]]": [30]
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