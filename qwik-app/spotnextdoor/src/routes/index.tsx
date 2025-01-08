import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useUser } from "./layout";
import { Navbar } from "~/components/main-navbar/main-navbar";


export default component$(() => {
  useStylesScoped$(`
  /* css aqui */
  
  `);
  const user = useUser();
  if (user.value) {
    return (
      <>
        < Navbar>
          Things Here!
        </Navbar>
        Home
      </>
    )
  }
  else {
    return (
      <>
        A place where you can find a better connection between your portfolio and your contractor!
        <br />
        <a href="/login">Login</a>
      </>
    );
  }
});