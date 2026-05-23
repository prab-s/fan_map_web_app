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
	() => import('./nodes/26')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/catalogue": [3],
		"/editor": [4],
		"/editor/create": [5],
		"/editor/edit": [6],
		"/editor/edit/[product]": [7],
		"/editor/product-types": [8],
		"/editor/product-types/create": [9],
		"/editor/product-types/edit": [10],
		"/editor/product-types/edit/[product_type]": [11],
		"/editor/series": [12],
		"/editor/series/create": [13],
		"/editor/series/edit": [14],
		"/editor/series/edit/[series]": [15],
		"/entry": [16],
		"/map": [17],
		"/products": [18],
		"/products/type/[product_type]": [20],
		"/products/[product]": [19],
		"/series/[series]": [21],
		"/setup": [22],
		"/template-builder-v2": [24],
		"/template-builder": [23],
		"/viewer": [25],
		"/viewer/[tab]/[[record]]": [26]
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