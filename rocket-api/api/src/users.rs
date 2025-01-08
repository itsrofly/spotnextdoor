use rocket::fairing::AdHoc;
use rocket::http::Status;
use rocket::serde::{Deserialize, Serialize};
use rocket_db_pools::{sqlx, Database, Connection};
use rocket_db_pools::sqlx::Row;

#[derive(Database)]
#[database("usersdb")]
struct Db(sqlx::PgPool);


#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Page {
    name: String,
    parent: Option<String>,
    page_data: PageData,
}


#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct PageData {
    id: String,
    html: String,
    css: String,
}

#[get("/status/postgres")]
async fn status_postgres(mut db: Connection<Db>) -> Status {
    let result = sqlx::query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_pages')")
    .fetch_one(&mut **db)
    .await;

    match result {
        Ok(row) => {
            let exists = row.try_get(0).ok();
            match exists {
                Some(true) => Status::Ok,  // Table exists
                _ => Status::NotFound,    
            }
        },
        Err(_) => Status::InternalServerError, // Error occurred during query execution
    }
}


#[post("/<user>/<page_root>/save", data = "<page_data>")]
async fn save(mut db: Connection<Db>, user: &str, page_root: &str, page_data: &str) -> Status {

    let result = sqlx::query("INSERT INTO user_pages (user_root, page_data) VALUES ($1, $2) ON CONFLICT (user_root) DO UPDATE SET page_data = EXCLUDED.page_data;")
        .bind(user.to_owned() + ":" + page_root)
        .bind(page_data)
        .execute(&mut **db)
        .await;

    match result {
        Ok(_) => Status::Created,
        Err(_) => Status::InternalServerError, // Error occurred during query execution
    }
}


#[get("/<user>/<page_root>/load")]
async fn load(mut db: Connection<Db>, user: &str, page_root: &str) -> Result<String, Status> {


    let result = sqlx::query("SELECT page_data FROM user_pages WHERE user_root = $1")
        .bind(user.to_owned() + ":" + page_root)
        .fetch_one(&mut **db)
        .await;

    match result {
        Ok(row) => {
            let page_data = row.try_get::<String, _>(0);
            match page_data {
                Ok(page_data) => Ok(page_data.to_string()),
                Err(_) => Err(Status::NotFound), // Error occurred during page_data extraction
            }
        } ,
        Err(_) => Err(Status::NotFound), // Error occurred during query execution
    }
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("User Manager Stage", |rocket| async {
        rocket.attach(Db::init())
            .mount("/users", routes![save, status_postgres, load])
    })
}