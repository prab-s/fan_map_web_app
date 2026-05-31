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
	() => import('./nodes/27')
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
		"/editor/series": [13],
		"/editor/series/create": [14],
		"/editor/series/edit": [15],
		"/editor/series/edit/[series]": [16],
		"/entry": [17],
		"/map": [18],
		"/products": [19],
		"/products/type/[product_type]": [21],
		"/products/[product]": [20],
		"/series/[series]": [22],
		"/setup": [23],
		"/template-builder-v2": [25],
		"/template-builder": [24],
		"/viewer": [26],
		"/viewer/[tab]/[[record]]": [27]
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