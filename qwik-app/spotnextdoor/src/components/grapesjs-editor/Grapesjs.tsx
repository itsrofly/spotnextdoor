import { $, component$, useSignal, useOn, useStore, noSerialize, type NoSerialize } from "@builder.io/qwik";
import grapesjs from "grapesjs";
import { type Editor } from "grapesjs";
import plugin_basics from 'grapesjs-blocks-basic';
import { Navbar } from "../main-navbar/main-navbar";
import { LeftBar } from "./LeftBar";
import { Parent, newPageCss, newPageHtml, type userPageData } from "./pages/PageContent";
import { generateUniqueID } from "~/plugins/unique-id";
import Mobile from "~/media/mobile.svg?jsx";
import Desktop from "~/media/desktop.svg?jsx"
import 'grapesjs/dist/css/grapes.min.css';
import './style.css'
import { load, publish, save } from "~/routes/[user]/layout";


export const Grapesjs = component$<{ user: string, root: string }>(({ user, root }) => {
  const store = useStore<{ editor: NoSerialize<Editor> }>({ editor: undefined });
  const deviceOpt = useSignal(0);
  const editorReady = useSignal(false);
  const publishColor = useSignal("primary");
  const publishText = useSignal("Publish");
  const publishing = useSignal(false);


  const getData = $(() => {
    const pages = store.editor?.Pages.getAll();
    return pages?.reduce((data: userPageData[], page) => {
      const id = page.getId();
      const name = page.getName();
      if (id.includes(":")) {
        const component = page.getMainFrame().getComponent();
        const html = component.getInnerHTML();
        const css = store.editor?.getCss(({ component: component }))?.replaceAll("* { box-sizing: border-box; } body {margin: 0;}", "");
        data.push({
          name: name,
          id: id,
          parentId: Parent(id.split(":")[0], pages),
          data: {
            html: html,
            css: css
          }
        })
      }
      return data;
    }, [])
  });

  useOn('qvisible', $(() => {
    const plugin_saver = ((editor: Editor) => {
      editor.Storage.add('DataManager', {
        async load() {
          const data: userPageData[] | false = await load(user, root);
          const pageManager = editor.Pages;

          if (data && data.length > 0) {
            data.map((PageData) => {
              pageManager.add({
                id: PageData.id,
                name: PageData.name,
                component: PageData.data.html,
                styles: PageData.data.css,
              })
            })
          }
          else {
            const id = generateUniqueID()
            pageManager.add({
              id: '0:' + id,
              name: root,
              component: newPageHtml(id),
              styles: newPageCss(id),
            })
          }
          return {};
        },
        async store() {
          const data = await getData();
          if (!data)
            return
          save(user, root, data);
        }
      });
    })

    const editor = grapesjs.init({
      container: '.grapesjs',
      storageManager: {
        type: 'DataManager',
        stepsBeforeSave: 1,
        autosave: true
      },
      panels: { defaults: [] },
      deviceManager: {
        devices: [{
          name: 'Desktop',
          width: '', // default size
        }, {
          name: 'Mobile',
          width: '320px', // this value will be used on canvas width
          widthMedia: '480px', // this value will be used in CSS @media
        }]
      },
      blockManager: { appendTo: '.left-blocks' },
      layerManager: { appendTo: '.left-layer' },
      styleManager: { appendTo: '.styles' },
      selectorManager: { appendTo: '.selector' },
      traitManager: { appendTo: '.asset' },
      plugins: [plugin_basics, plugin_saver],
      canvas: {
        scripts: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'],
        styles: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css']
      },

    });
    store.editor = noSerialize(editor);

    const leftBarElements = document.querySelectorAll('.grid-layout *');
    leftBarElements.forEach(element => {
      element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    });
  }))


  store.editor?.onReady(() => {
    editorReady.value = true;
    const pages = store.editor?.Pages.getAll();
    const pageManager = store.editor?.Pages;
    const lastPage = pages?.at(pages.length - 1);
    pageManager?.select(lastPage ? lastPage : "");
    store.editor?.LayerManager.__appendTo();
  })

  return (
    <div class="grid-layout w-100 h-100">
      <Navbar>

        <button type="button" class={"btn component-button adap border-0 " + ((deviceOpt.value == 0) ? "active" : "")} onClick$={() => {
          deviceOpt.value = 0
          store.editor?.setDevice('Desktop')
        }}>
          <Desktop class="component-svg adap" />
        </button>

        <button type="button" class={"btn component-button adap border-0 " + ((deviceOpt.value == 1) ? "active" : "")} onClick$={() => {
          deviceOpt.value = 1
          store.editor?.setDevice('Mobile')
        }}>
          <Mobile class="component-svg adap" />
        </button>

        <button type="button" class={`btn btn-outline-${publishColor.value}`} disabled={publishing.value} onClick$={async () => {
          const data = await getData();
          if (!data)
            return
          publishing.value = true;
          publishText.value = "Publishing..."
          const isPublished = await publish(user, root, data);

          if (isPublished) {
            publishText.value = "Done!"
            publishColor.value = "success"
          } else {
            publishText.value = "Failed!"
            publishColor.value = "danger"
          }
          await new Promise((res) => setTimeout(res, 1000))
          publishText.value = "Publish";
          publishColor.value = "primary";
          publishing.value = false;
        }}>{publishText.value}</button>
      </Navbar>

      <div class="left mh-100 overflow-auto" >
        <LeftBar editor={store.editor} />
      </div>

      <div class="main mh-100 mw-100">
        {!editorReady.value ?
          <div class="spinner-grow text-success d-flex justify-content-center w-100 rounded-0" role="status"
            style={{ height: "2px", backgroundColor: "#00E0FF" }}>
          </div>
          : <></>}
        <div class="grapesjs"></div>
      </div>

      <div class="right mh-100 overflow-auto" id='custom-scroll-container'>
        <div class="w-100 device"></div>
        <div class="w-100 asset"></div>
        <div class="w-100 selector"></div>
        <div class="w-100 styles" style={{ height: "1fr" }} ></div>
      </div>
    </div>
  );
});


