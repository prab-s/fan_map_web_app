
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/bulk-import" | "/catalogue" | "/editor" | "/editor/create" | "/editor/edit" | "/editor/edit/[product]" | "/editor/product-types" | "/editor/product-types/create" | "/editor/product-types/edit" | "/editor/product-types/edit/[product_type]" | "/editor/product" | "/editor/product/create" | "/editor/product/edit" | "/editor/series" | "/editor/series/create" | "/editor/series/edit" | "/editor/series/edit/[series]" | "/entry" | "/map" | "/products" | "/products/type" | "/products/type/[product_type]" | "/products/[product]" | "/series" | "/series/[series]" | "/setup" | "/template-builder-v2" | "/template-builder" | "/viewer" | "/viewer/[tab]" | "/viewer/[tab]/[[record]]";
		RouteParams(): {
			"/editor/edit/[product]": { product: string };
			"/editor/product-types/edit/[product_type]": { product_type: string };
			"/editor/series/edit/[series]": { series: string };
			"/products/type/[product_type]": { product_type: string };
			"/products/[product]": { product: string };
			"/series/[series]": { series: string };
			"/viewer/[tab]": { tab: string };
			"/viewer/[tab]/[[record]]": { tab: string; record?: string }
		};
		LayoutParams(): {
			"/": { product?: string; product_type?: string; series?: string; tab?: string; record?: string };
			"/bulk-import": Record<string, never>;
			"/catalogue": Record<string, never>;
			"/editor": { product?: string; product_type?: string; series?: string };
			"/editor/create": Record<string, never>;
			"/editor/edit": { product?: string };
			"/editor/edit/[product]": { product: string };
			"/editor/product-types": { product_type?: string };
			"/editor/product-types/create": Record<string, never>;
			"/editor/product-types/edit": { product_type?: string };
			"/editor/product-types/edit/[product_type]": { product_type: string };
			"/editor/product": Record<string, never>;
			"/editor/product/create": Record<string, never>;
			"/editor/product/edit": Record<string, never>;
			"/editor/series": { series?: string };
			"/editor/series/create": Record<string, never>;
			"/editor/series/edit": { series?: string };
			"/editor/series/edit/[series]": { series: string };
			"/entry": Record<string, never>;
			"/map": Record<string, never>;
			"/products": { product_type?: string; product?: string };
			"/products/type": { product_type?: string };
			"/products/type/[product_type]": { product_type: string };
			"/products/[product]": { product: string };
			"/series": { series?: string };
			"/series/[series]": { series: string };
			"/setup": Record<string, never>;
			"/template-builder-v2": Record<string, never>;
			"/template-builder": Record<string, never>;
			"/viewer": { tab?: string; record?: string };
			"/viewer/[tab]": { tab: string; record?: string };
			"/viewer/[tab]/[[record]]": { tab: string; record?: string }
		};
		Pathname(): "/" | "/bulk-import" | "/catalogue" | "/editor" | "/editor/create" | "/editor/edit" | `/editor/edit/${string}` & {} | "/editor/product-types" | "/editor/product-types/create" | "/editor/product-types/edit" | `/editor/product-types/edit/${string}` & {} | "/editor/series" | "/editor/series/create" | "/editor/series/edit" | `/editor/series/edit/${string}` & {} | "/entry" | "/map" | "/products" | `/products/type/${string}` & {} | `/products/${string}` & {} | `/series/${string}` & {} | "/setup" | "/template-builder-v2" | "/template-builder" | "/viewer" | `/viewer/${string}${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | string & {};
	}
}