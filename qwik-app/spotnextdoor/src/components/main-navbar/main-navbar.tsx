import { component$, Slot } from "@builder.io/qwik";
// import { useUser } from "../../routes/layout";

import Favicon from '~/media/favicon.svg?jsx';

export const Navbar = component$(() => {
  // const log = useUser();
  return (
    <div class="navbar border-bottom border-white component-bg adap header">
      <div class="container d-flex justify-content-between align-items-center">
        <a href="/" class="navbar-brand d-flex align-items-center">
          <ul class="list-inline m-auto">
            <li class="list-inline-item">
              <Favicon/>
            </li>
            <li class="list-inline-item">
              <strong class="component-txt adap">SpotNextDoor</strong>
            </li>
          </ul>
        </a>

        <div class="d-flex">
        < Slot/>
        </div>

      </div>
    </div>
  );
});
