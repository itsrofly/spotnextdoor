import {
    type RequestHandler,
} from '@builder.io/qwik-city';



export const onRequest: RequestHandler = async ({
    redirect,
    cookie,
}) => {
    // If user exist, delete cookie
    if (cookie.get("user")) {
        cookie.delete("user");
    }
    throw redirect(308, '/');
};