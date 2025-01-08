import {
    type RequestHandler,
} from '@builder.io/qwik-city';

interface Login {
    email: string;
    password: string;
    checkbox: boolean;
}

export const onRequest: RequestHandler = async ({
    redirect,
    cookie,
}) => {
    if (cookie.get("user")) {
        throw redirect(308, '/');
    }
};


export const onPost: RequestHandler = async ({
    parseBody,
    cookie,
    send,
    headers
}) => {
    const value = await parseBody() as Login;
    const userData = { name: "John Doe" , user: "john"};
    const date = new Date()
    date.setFullYear(date.getFullYear() + 10)

    if (value.checkbox) {
        cookie.set("user", userData, { path: "/", expires: date })
    }
    else {
        cookie.set("user", userData, { path: "/" })
    }
    headers.set('Location', '/')
    send(308, 'Redirecting to /')
};
