import type { Driver } from 'neo4j-driver';
import neo4j from 'neo4j-driver';
import type { pageData, userPageData } from '~/components/grapesjs-editor/pages/PageContent';

export class Neo4jGraph {
    private driver: Driver;

    constructor() {
        try {
            this.driver = neo4j.driver("neo4j://localhost", neo4j.auth.basic("neo4j", "password")); // neo4j
        } catch (error) {
            throw new Error('Failed to connect to Neo4j database: ' + error);
        }
    }

    async saveData(userId: string, root: string,  data: userPageData[]) {
        const session = (this.driver).session();

        try { // Remove the user page data and save with the new data
            // Find a better way to do it

            // Begin a transaction
            const tx = session.beginTransaction();

            // Remove all nodes and relationships with the given familyId
            await tx.run(
                'MATCH (p:Page {user: $userId, root: $root}) OPTIONAL MATCH (p)-[r]-() DELETE p, r',
                { userId: userId, root: root }
            );
            await tx.commit();

            for (const pageData of data) { // Create nodes for each Page
                await session.run(
                    'CREATE (p:Page {user: $userId, root: $root, id: $id, name: $name, data: $data}) RETURN p',
                    { userId: userId, root: root, id: pageData.id, name: pageData.name, data: JSON.stringify(pageData.data) }
                );


                if (pageData.parentId) { // If the page has a parent, create a relationship
                    await session.run(
                        'MATCH (parent:Page { user: $userId, root: $root, id: $parentId}), (child:Page { user: $userId, root: $root, id: $childId }) ' +
                        'CREATE (parent)-[:PARENT_OF]->(child)',
                        { userId: userId, root: root, parentId: pageData.parentId, childId: pageData.id }
                    );
                }
            }
            return true;
        } catch (error) {
            console.error('Error occurred saveData | ', error + " | User - " + userId);
            return false;
        } finally {
            await session.close();

        }
    }

    async getData(userId: string) {
        const session = this.driver.session();

        try {
            const result = await session.run(
                'MATCH (p:Page {user: $userId}) OPTIONAL MATCH (p)-[r]-() RETURN p, r',
                { userId }
            );

            // Extract and return the records

            return result.records.map(record => ({
                page: record.get('p').properties
            }));
        } finally {
            await session.close();
        }
    }

    async getPage(userId: string, path: string) {
        const session = (this.driver).session();

        try {
            const names = path.split('/').filter(Boolean);
            let query = 'MATCH ';

            for (let i = 0; i < names.length; i++) {
                query += `(p${i}:Page {user: $userId, name: $name${i} })`;
                if (i < names.length - 1) {
                    query += '-[:PARENT_OF]->';
                }
            }
            query += 'WHERE NOT ()-[:PARENT_OF]->(p0)'
            query += ' RETURN ';

            // Return the info of the last Page in the path
            query += `p${names.length - 1}.data`;

            const parameters: { [key: string]: any } = { userId };

            names.forEach((name, index) => {
                parameters[`name${index}`] = name;
            });
            const result = await session.run(query, parameters);
            if (result.records.length > 0) {
                const match = result.records[0].toObject();
                const data: pageData = JSON.parse(match[`p${names.length - 1}.data`]);
                return data;
            } else {
                return false;
            }
        }
        catch (error) {
            console.error('Error occurred getPage | ', error + " | User - " + userId);
            return false;
        } finally {
            await session.close();
        }
    }
}
