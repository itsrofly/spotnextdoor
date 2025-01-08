import type { NoSerialize, Signal } from "@builder.io/qwik";
import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import type { Editor, Page } from "grapesjs";
import type { SortedPage } from "./PageContent";
import { Parent, checkName, sortPages } from "./PageContent";

import expand from "~/media/expand.svg"
import move from "~/media/move.svg"
import point from "~/media/point.svg"

interface LayerProps {
    obj: SortedPage,
    index: number,
    editor: NoSerialize<Editor>,
    signals: {
        maxIndex: Signal,
        isMouseDown: Signal,
        setHoveredId: Signal,
        setElement: Signal,
        setSelected: Signal,
        allPages: Signal<SortedPage[]>
    }
}

function isParent (id: string, idElement: string, pages: Page[]) : boolean {
    const parent = Parent(id, pages);
    if (!parent || parent.split(":")[0] == "0")
        return false;

    if (parent.split(":")[1] == idElement) 
        return true;
    else 
        return isParent(parent.split(":")[0], idElement, pages);
}

export const Layer = component$<LayerProps>(({ obj, editor, index, signals }) => {

    if (!editor || !obj.page)
        return (<></>)

    const isCollapsed = useSignal(true);
    const setPageName = useSignal<string>(obj.page.getName() || "");
    const setRef = useSignal<HTMLElement>();
    const isEditing = useSignal(false);

    useTask$(({ track }) => {
        track(() => setRef.value);
        setRef.value?.focus();
    });

    const handleMouseEnter = $((e: any) => {
        signals.setHoveredId.value = e.target.id;

        if (signals.isMouseDown.value && signals.setHoveredId.value) {
            if (signals.setHoveredId.value != signals.setElement.value?.getId() 
            && !isParent(signals.setHoveredId.value?.split(":")[0], signals.setElement.value?.getId().split(":")[1], editor.Pages.getAll())) {
                signals.setSelected.value = signals.setHoveredId.value;
            }
        }
    });

    const handleMouseLeave = $(() => {
        signals.setSelected.value = null;
        signals.setHoveredId.value = null;
    });

    const handleMouseDown = $((e: any) => {
        if (e.button === 0) {
            signals.isMouseDown.value = true;
        }
    });

    const handleClick = $((e: any) => {
        if (e.target.id === obj.page?.getId()) {
            signals.setElement.value = obj.page;
            const pageManager = editor.Pages;
            pageManager.select(obj.page ? obj.page.getId() : "");
            editor.refresh();
        }
    });


    const handleChangePage = $(() => {
        if (!obj.page)
            return

        isEditing.value = false;
        const pageManager = editor.Pages;
        setPageName.value = (setPageName.value || "").replace(/\s+/g, "");
        const match = setPageName.value.match(/[a-zA-Z]+(?:-[a-zA-Z0-9]+)*/g);
        setPageName.value = match ? match.join("") : "";

        if (setPageName.value.length === 0) {
            setPageName.value = obj.page.getName() || "";
            return;
        }

        if (checkName(pageManager.getAll(), setPageName.value, obj.page.getId().split(":")[0])) {
            setPageName.value = obj.page.getName();
        }

        obj.page.setName(setPageName.value);
        signals.allPages.value = sortPages(pageManager.getAll(), "0");
    });

    return (
        <div >
            <div onMouseEnter$={handleMouseEnter} onMouseDown$={handleClick} onMouseLeave$={handleMouseLeave} id={obj.page.getId()} style={{ cursor: "pointer", height: 25 + "px", width: `calc(${(signals.maxIndex.value) * (10)}px + 95%)`, backgroundColor: signals.setElement.value?.getId() == obj.page.getId() ? "#00c8ff" : "", userSelect: "none", borderBottom: "0.5px solid black" }}>
                <div class="grid-page-component" style={{ marginLeft: "6px", marginRight: "6px", backgroundColor: signals.setElement.value?.getId() == obj.page.getId() ? "#00c8ff" : "" }}>
                    <div class="namec" id={obj.page.getId()} style={{ paddingLeft: `${index * 10}px` }} >
                        {obj.childs.length > 0 ? <img draggable={false} class="component-svg adap" src={expand} alt="collaps" style={{ cursor: "pointer", transform: isCollapsed.value ? "rotate(180deg)" : "rotate(90deg)" }} width={13} height={13} onClick$={() => { isCollapsed.value = !isCollapsed.value; }} /> : <div style={{ display: "inline-block", width: "14px", overflow: "none" }}></div>}
                        <span class="component-txt adap" id={obj.page.getId()} style={{ fontSize: "14px", marginLeft: "5px" }} onDblClick$={() => { isEditing.value = obj.page?.getId().split(":")[0] != "0"; }}>
                            {isEditing.value ? <input type="text" maxLength={50} class="gjs-layer-name gjs-no-app gjs-layer-name--edit" bind:value={setPageName} onChange$={handleChangePage} onBlur$={handleChangePage} autoComplete={"off"} autoCorrect={"off"} spellcheck={false} ref={setRef} style={{ backgroundColor: "transparent", border: "none", height: "14px", width: `${setPageName.value.length}ch`, maxWidth: "90px" }} /> 
                            : setPageName.value && (setPageName.value.length > 12) ? setPageName.value.substring(0, 15 - 3) + "..." : setPageName.value}</span>
                    </div>
                    <div class="movec">
                        <div id={obj.page.getId()} onMouseDown$={handleMouseDown} style={{ cursor: "pointer" }}>
                            {obj.page.getId().split(":")[0] != "0" && (signals.setSelected.value == obj.page.getId() ?
                                <img draggable={false} src={point} alt="selected" width={13} height={13} style={{ filter: "invert(70%) sepia(85%) saturate(2906%) hue-rotate(145deg) brightness(107%) contrast(103%)" }} />
                                : <img draggable={false} id={obj.page.getId()} class="component-svg adap" src={move} width={13} height={13} />)}
                        </div>
                    </div>
                </div>
            </div>
            {isCollapsed.value && <div class="childs">{obj.childs.map((value) => <Layer editor={editor} obj={value} index={index + 1} signals={signals} key={value.page?.getId()} />)}</div>}
        </div>
    );
});