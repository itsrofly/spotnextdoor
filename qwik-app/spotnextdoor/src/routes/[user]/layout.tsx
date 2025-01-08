import {
    server$,
    type RequestHandler,
} from '@builder.io/qwik-city';
import type { userPageData } from '~/components/grapesjs-editor/pages/PageContent';
import { Neo4jGraph } from '~/plugins/neo4j-db';

export interface User {
    name: string;
    user: string;
}

export const save = server$(async function (user, root, data: userPageData[]) {
    try {
      await fetch(`http://localhost:8000/users/${user}/${root}/save`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Failed to save page data | " + error + " | User - " + user);
    }
  });
  
  
  export const load = server$(async function (user, root) {
    try {
      const rest = await fetch(`http://localhost:8000/users/${user}/${root}/load`); // rocket-api
      if (rest.status == 200)
        return await rest.json();
      else
        return false;
    } catch (error) {
      console.error("Failed to load page data | " + error + " | User - " + user);
      return false;
    }
  });
  
  
  export const publish = server$(async function (user, root, data: userPageData[]) {
    const Neo4j = new Neo4jGraph();
    return await Neo4j.saveData(user, root, data);
  })
  

export const onRequest: RequestHandler = async ({
    query,
    sharedMap,
    params
}) => {
    const user = sharedMap.get('user') as User;
    const hasBuilder = query.get("builder");

    if (hasBuilder &&  await load(user.user, hasBuilder) &&  user.user == params.user && user.user)
        sharedMap.set('hasBuilder', hasBuilder);
    else
        sharedMap.set('hasBuilder', null);
};





