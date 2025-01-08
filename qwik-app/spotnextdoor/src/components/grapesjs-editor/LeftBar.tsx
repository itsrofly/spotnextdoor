import { component$, useSignal, type NoSerialize } from "@builder.io/qwik";
import type { Editor } from "grapesjs";
import Addbox from '~/media/addbox.svg?jsx';
import Layer from '~/media/layer.svg?jsx';
import Pages from '~/media/pages.svg?jsx';
import { PageContent } from "./pages/PageContent";



export const LeftBar = component$<{ editor: NoSerialize<Editor> }>(({ editor }) => {
    const leftOpt = useSignal(0);

    return (
        <div class="h-100 w-100 component-bg adap border-end grid-left">
            <div class='left-options component-bg adap border-bottom h-100 w-100 '>
                <ul class="list-inline m-auto h-100 w-100 d-flex align-items-center justify-content-around">
                    <li class="list-inline-item">
                        <button type="button" class={"btn component-button adap border-0 " + ((leftOpt.value == 0) ? "active" : "")} onClick$={() => {
                            leftOpt.value = 0;
                        }}>
                            <Addbox class="component-svg adap" />
                        </button>
                    </li>
                    <li class="list-inline-item">
                        <button type="button" class={"btn component-button adap border-0 " + ((leftOpt.value == 1) ? "active" : "")} onClick$={() => {
                            leftOpt.value = 1;
                        }}>
                            <Layer class="component-svg adap" />
                        </button>
                    </li>
                    <li class="list-inline-item">
                        <button type="button" class={"btn component-button adap border-0 " + ((leftOpt.value == 2) ? "active" : "")} onClick$={() => {
                            leftOpt.value = 2;
                        }}>
                            <Pages class="component-svg adap" />
                        </button>
                    </li>
                </ul>
            </div>
            <div class='left-component overflow-auto h-100 w-100' id='custom-scroll-container'>
                <div class='grid-left-component h-100 w-100' style={{ display: (leftOpt.value != 0) ? 'none' : '' }}>
                    <div class='left-blocks'></div>
                </div>
                <div class='h-100 w-100 left-layer component-txt component-bg adap' style={{ display: (leftOpt.value != 1) ? 'none' : '' }}></div>
                <div class='h-100 w-100 left-pages' style={{ display: (leftOpt.value != 2) ? 'none' : '' }}>
                    {leftOpt.value == 2 && <PageContent editor={editor} />}
                </div>
            </div>
        </div>
    )
})