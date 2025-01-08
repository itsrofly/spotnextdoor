import type { NoSerialize } from "@builder.io/qwik";
import { $, component$, noSerialize, useSignal, useTask$ } from "@builder.io/qwik";
import type { Editor, Page } from "grapesjs";

import { Layer } from "./Layer";
import { generateUniqueID } from "~/plugins/unique-id";

export interface SortedPage {
    page: NoSerialize<Page>;
    childs: SortedPage[];
}

export interface userPageData {
    name: string;
    id: string;
    parentId: string | null;
    data: pageData;
}

export interface pageData {
    html: string;
    css?: string;
}

export const newPageHtml = (id: string) => {
    return (`<main class="${id}" id="custom-scroll-container"></main>`)
}

export const newPageCss = (id: string) => {
    return (`.${id} {     
        margin: 0;
        padding: 0;
        width: 100vw; /* 100% of viewport width */
        height: 100vh; /* 100% of viewport height */
        overflow: auto; /* Allow overflow content */ 
        }
    
      /* Style the scrollbar */
        #custom-scroll-container::-webkit-scrollbar {
        width: 4px;
        height: 4px;
        }

        /* Track */
        #custom-scroll-container::-webkit-scrollbar-track {
        background: transparent;
        }

        /* Handle */
        #custom-scroll-container::-webkit-scrollbar-thumb {
        background: gray;
        }

        /* Handle on hover */
        #custom-scroll-container::-webkit-scrollbar-thumb:hover {
        background: gray;
        }`
    )
}

export const Parent = (id: string, pages: Page[]) => {
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].getId().split(":")[1] == id)
        return pages[i].getId();
    }
    return null;
  }

export function sortPages(pages: Page[] | undefined, id: string): SortedPage[] {
    if (!pages) return [];

    const sortedPages: SortedPage[] = [];

    for (const page of pages) {
        const serializedPage = noSerialize(page);
        const pageInfo = serializedPage?.getId().split(":");
        if (pageInfo && pageInfo[0] === id) {
            const childPages = sortPages(pages, pageInfo[1]);
            sortedPages.push({
                page: serializedPage,
                childs: childPages
            });
        }
    }

    return sortedPages;
}


export function checkName(pages: any, name: string, id: string) {
    return pages.some((page: any) => page.getName() === name && page.getId().split(":")[0] === id);
}

function deletePages(pageManager: any, id: string) {
    const pages = pageManager?.getAll();
    if (!pages) return;

    for (const page of pages) {
        const pageIdParts = page.getId().split(":");
        if (pageIdParts[0] === id.split(":")[1]) {
            deletePages(pageManager, page.getId());
        }
    }
    pageManager?.remove(id);
}

export const PageContent = component$<{ editor: NoSerialize<Editor> }>(({ editor }) => {
    const pageManager = editor?.Pages;
    const isMenuOpen = useSignal(false);
    const xMenu = useSignal(0);
    const yMenu = useSignal(0);

    const maxIndex = useSignal(0);
    const isMouseDown = useSignal(false);
    const setHoveredId = useSignal<string | null>();
    const setElement = useSignal<NoSerialize<Page> | null>(pageManager ? noSerialize(pageManager.getSelected()) : null);
    const isOut = useSignal(false);
    const setSelected = useSignal<string | null>(null);

    const allPages = useSignal(sortPages(pageManager?.getAll(), "0"));



    // Update maxIndex based on the number of layers
    useTask$(({ track }) => {
        track(() => {
            // Find the maximum index among all layers
            const layersMaxIndex = allPages.value.reduce((max, value) => {
                const getIndexRecursively = (page: SortedPage, depth: number): number => {
                    let maxIndex = depth;
                    for (const child of page.childs) {
                        maxIndex = Math.max(maxIndex, getIndexRecursively(child, depth + 1));
                    }
                    return maxIndex;
                };
                return Math.max(max, getIndexRecursively(value, 1));
            }, 0);
            // Update maxIndex signal
            maxIndex.value = layersMaxIndex;
        });
    });




    const signals = {
        maxIndex,
        isMouseDown,
        setHoveredId,
        setElement,
        setSelected,
        allPages
    };

    const handleClick = $((e: any) => {
        if (e.target.id.includes("out")) {
            setSelected.value = null;
        }
        if (e.target.id !== "menu") {
            isMenuOpen.value = false;
        }

    })

    const handleMenu = $((e: any) => {
        isMenuOpen.value = true;
        xMenu.value = e.clientX;
        yMenu.value = e.clientY;


        if (e.target.id.includes("out"))
            isOut.value = true;
        else
            isOut.value = false
    })

    const handleCreatePage = $(() => {
        const pageManager = editor?.Pages;
        const pages = pageManager?.getAll();
        const pageId = generateUniqueID();
        let pageName = "New-Page"

        if (setElement.value) {
            const parentId = setElement.value.getId().split(":")[1];

            for (let i = 1; checkName(pages, pageName, parentId); i++) {
                pageName = "New-Page" + i;
            }
            pageManager?.add({
                name: pageName,
                id: parentId + ":" + pageId,
                component: newPageHtml(pageId),
                styles: newPageCss(pageId),

            })
        }
        allPages.value = sortPages(pageManager?.getAll(), "0");
    })

    const handleDuplicatePage = $(() => {
        const pageManager = editor?.Pages;
        const pages = pageManager?.getAll();


        const duplicateChild = (oldId: string, id: string) => {
            if (!pages)
                return


            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                if (page.getId().split(":")[0] == oldId) {
                    const pageId = generateUniqueID();
                    const pageName = page.getName();
                    const component = page.getMainFrame().getComponent();

                    let style = editor?.getCss(({ component: component }));
                    style = style?.replaceAll("* { box-sizing: border-box; } body {margin: 0;}", "");
                    style = style?.replaceAll(page.getId().split(":")[1], pageId);

                    pageManager?.add({
                        name: pageName,
                        id: id + ":" + pageId,
                        component: component.getInnerHTML().replaceAll(page.getId().split(":")[1], pageId),
                        styles: style
                    })
                    duplicateChild(page.getId().split(":")[1], pageId);
                }
            }
        }

        if (setElement.value && pages) {
            const pageId = generateUniqueID();
            const parentId = setElement.value.getId().split(":")[0];
            const component = setElement.value.getMainFrame().getComponent();
            let pageName = setElement.value.getName();

            for (let i = 1; checkName(pages, pageName, parentId); i++) {
                pageName = setElement.value.getName() + i;
            }

            let style = editor?.getCss(({ component: component }));
            style = style?.replaceAll("* { box-sizing: border-box; } body {margin: 0;}", "");
            style = style?.replaceAll(setElement.value.getId().split(":")[1], pageId);

            pageManager?.add({
                name: pageName,
                id: parentId + ":" + pageId,
                component: component.getInnerHTML().replaceAll(setElement.value.getId().split(":")[1], pageId),
                styles: style
            })
            duplicateChild(setElement.value.getId().split(":")[1], pageId);
        }
        allPages.value = sortPages(pageManager?.getAll(), "0");
    })

    const handleRemovePage = $(() => {
        const pageManager = editor?.Pages;
        if (setElement.value) {
            deletePages(pageManager, setElement.value.getId());
        }
        allPages.value = sortPages(pageManager?.getAll(), "0");
    })

    const handleMouseUp = $(() => {
        if (isMouseDown.value) {
            if (setSelected.value && setElement.value) {
                const element = setElement.value.getId();
                const newParent = setSelected.value.split(":")[1];
                const pageManager = editor?.Pages;
                const elementPage = pageManager?.get(element);
                const pages = pageManager?.getAll();
                let pageName = setElement.value.getName();

                for (let i = 1; checkName(pages, pageName, newParent); i++) {
                    pageName = setElement.value.getName() + i;
                }

                setElement.value.setName(pageName);
                elementPage?.set("id", `${newParent}:${element.split(":")[1]}`);
                allPages.value = sortPages(pageManager?.getAll(), "0");
                maxIndex.value = 0;
            }
            setElement.value = null;
            setSelected.value = null;
        }
        isMouseDown.value = false;
    });


    return (
        <div class="w-100 h-100 grid-page" onMouseUp$={handleMouseUp} onClick$={handleClick} onContextMenu$={handleMenu}>
            <div id="pages">
                {allPages.value.map((value) => <Layer editor={editor} obj={value} index={1} signals={signals} key={value.page?.getId()} />)}
            </div>
            <div id="out" style={{ width: `calc(${(maxIndex.value) * (10)}px + 95%)` }}>

            </div>
            {isMenuOpen.value &&
                <div class="list-group" id="menu" style={{ position: "fixed", width: "130px", fontSize: "14px", top: yMenu.value, left: xMenu.value, zIndex: 9999 }}>

                    {!isOut.value &&
                        <>
                            <button type="button" onClick$={handleCreatePage} class="list-group-item list-group-item-action component-button adap component-txt">
                                <span class="adap component-txt">Create Page</span></button>
                            {setElement.value?.getId().split(":")[0] !== "0" &&
                                <>
                                    <button type="button" onClick$={handleDuplicatePage} class="list-group-item list-group-item-action component-button adap component-txt">
                                        <span class="adap component-txt">Duplicate Page</span></button>
                                    <button type="button" onClick$={handleRemovePage} class="list-group-item list-group-item-action component-button adap component-txt">
                                        <span class="adap component-txt">Remove Page</span></button>
                                </>
                            }
                            {setElement.value?.getId().split(":")[0] === "0" &&
                                <>
                                 <button type="button" class="list-group-item list-group-item-action component-button adap component-txt">
                                <span class="adap component-txt">Manage Page</span></button>
                                </>
                            }
                            <button type="button" class="list-group-item list-group-item-action component-button adap component-txt">
                                <span class="adap component-txt">Copy Link</span></button>

                        </>
                    }
                </div>
            }
        </div>
    );
});
