import { component$ } from "@builder.io/qwik";
import { usePage } from "./layout";


export default component$(() => {
    const page = usePage()

    if (page.value)
        return (
            <div dangerouslySetInnerHTML={page.value.html + `<style>${page.value.css}</style>`}></div>
        );
    else
        return (
            <strong>Error 404</strong>
        );
});