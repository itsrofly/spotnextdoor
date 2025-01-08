import {
  routeLoader$,
  type DocumentHead,
  type RequestHandler,
  type Cookie,
} from '@builder.io/qwik-city';
import { component$, Slot } from "@builder.io/qwik";


export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};


interface User {
  name: string;
  user: string;
}

// Wait HTTP Request
export const onRequest: RequestHandler = async ({
  sharedMap,
  cookie,
}) => {
  // Get user by cookie
  const user = await loadUserFromCookie(cookie);

  if (user) { // If user exist, set user in sharedMap to get acessed by other pages
    sharedMap.set('user', user);
  } else {
    sharedMap.set('user', null);
  }
};


function loadUserFromCookie(cookie: Cookie): User | null {
  // Get user from cookie 'user'
  const user = cookie.get("user");
  if (user) {
    if (user.value != "undefined") {
      return JSON.parse(user.value);

    }
  }
  return null;
}

// Get user in sharedMap by client (component)
export const useUser = routeLoader$(({ sharedMap }) => {
  return sharedMap.get('user') as User;
});


export default component$(() => {
  return (<Slot />);
});


export const head: DocumentHead = {
  title: "SpotNextDoor",
  meta: [
    {
      name: "SpotNextDoor",
      content: "The Final Social Media",
    },
  ],
};
