import { Slot, component$ } from "@builder.io/qwik";
import { server$, type RequestHandler, routeLoader$ } from "@builder.io/qwik-city";
import type { pageData } from "~/components/grapesjs-editor/pages/PageContent";
import { Neo4jGraph } from "~/plugins/neo4j-db";

const loadPage = server$(async (user: string, root: string) => {
    try {
        const neo4j = new Neo4jGraph()
        const page: pageData | false = await neo4j.getPage(user, root);
        return page;
    } catch (error) {
        console.error("Failed load Page")
        return false
    }

})

// Override caching for /dashboard pages to not cache as they are unique per visitor
export const onGet: RequestHandler = async ({ sharedMap, params }) => { // 
 /*
    cacheControl({  // Remove cache
        public: false,
        maxAge: 0,
        sMaxAge: 0,
        staleWhileRevalidate: 0,
    }); */

    const page = await loadPage(params.user, params.all);

    if (page)
        sharedMap.set("catchPage", { html: page.html, css: page.css });
    else
        sharedMap.set("catchPage", null);
};

export const usePage = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('catchPage') as { html: string, css?: string } | null;
});


export default component$(() => {
    return (<Slot />);
});

