import { component$ } from '@builder.io/qwik';
import { Grapesjs } from '~/components/grapesjs-editor/Grapesjs';
import { Navbar } from '~/components/main-navbar/main-navbar';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useBuilder = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('hasBuilder') as string;
});

const Builder = component$<{builderValue: string}>(({builderValue}) => {
    const user = "john";
    
    return (
        <div class="position-absolute w-100 h-100">
            <Grapesjs user={user} root={builderValue}/>
        </div>
    );
});

export default component$(() => {
    const hasBuilder = useBuilder();

    if (hasBuilder.value)
        return (<Builder builderValue={hasBuilder.value} />)
    else
        return (
            <>
                < Navbar>
                    Things Here!
                </Navbar>
                Perfil
            </>
        )
});