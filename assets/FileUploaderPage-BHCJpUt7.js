import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./FileUploader-C0O473W3.js";import{t as a}from"./Stack-wRt1e9tO.js";import{a as o,i as s,n as c,r as l,t as u}from"./docs-B_LZlyP5.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { reactive } from '@motifx/core';\r
import { FileUploader, Stack } from '@motifx-community/ui';\r
\r
// Simulates a server: takes two seconds per megabyte, reports progress and stops on the signal.\r
const send = (file: File, report: (fraction: number) => void, signal: AbortSignal) =>\r
    new Promise<string>((resolve, reject) => {\r
        const steps = 20;\r
        const wait = Math.max(600, Math.min(4000, (file.size / 1_000_000) * 2000)) / steps;\r
        let step = 0;\r
        const timer = setInterval(() => {\r
            step++;\r
            report(step / steps);\r
            if (step === steps) {\r
                clearInterval(timer);\r
                resolve(\`id-\${file.name}\`);\r
            }\r
        }, wait);\r
        signal.addEventListener('abort', () => {\r
            clearInterval(timer);\r
            reject(new Error('stopped'));\r
        });\r
    });\r
\r
/** Selected or dropped files upload immediately through a custom function, and each row shows progress, cancel, retry and remove. */\r
export default function Basic() {\r
    const s = reactive({ files: [] as readonly File[], told: '' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <FileUploader\r
                label="Attachments"\r
                helpText="Any files; a stand-in server takes them."\r
                upload={send}\r
                x-model={() => s.files}\r
                onUploaded={e => (s.told = \`\${e.file.name} is up as \${String(e.item.response)}.\`)}\r
                onUploadAborted={e => (s.told = \`\${e.file.name} was stopped.\`)}\r
            />\r
            <output class="fu-told">{() => s.told || \`\${s.files.length} file(s) taken\`}</output>\r
        </Stack>\r
    );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { FileUploader, Stack } from '@motifx-community/ui';\r
\r
/** Only pictures and PDFs, up to 2 MB each and three in all; a file outside is listed with the reason. */\r
export default function Limits() {\r
    const s = reactive({ files: [] as readonly File[], refused: '' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <FileUploader\r
                label="Documents"\r
                accept=".pdf,image/*"\r
                maxFileSize={2_000_000}\r
                maxFiles={3}\r
                required\r
                x-model={() => s.files}\r
                onFilesAdded={e => (s.refused = e.refused.length ? e.refused.map(r => r.message).join(' ') : '')}\r
            />\r
            <output class="fu-refused">{() => s.refused}</output>\r
        </Stack>\r
    );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button, FileUploader, Stack } from '@motifx-community/ui';\r
\r
const quick = (file: File, report: (fraction: number) => void) =>\r
    new Promise<void>(resolve => {\r
        let step = 0;\r
        const timer = setInterval(() => {\r
            report(++step / 10);\r
            if (step === 10) {\r
                clearInterval(timer);\r
                resolve();\r
            }\r
        }, 120);\r
    });\r
\r
/** An Upload button sends the selected files, or nothing is sent until code requests it. One file only, with no dropping. */\r
export default function Modes() {\r
    const s = reactive({ one: [] as readonly File[] });\r
    let manual!: FileUploader;\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <FileUploader label="Photo" multiple={false} allowDrop={false} accept="image/*" upload={quick} uploadMode="button" x-model={() => s.one} />\r
            <Stack orientation="horizontal" wrap align="center">\r
                <FileUploader ref={(u: FileUploader) => (manual = u)} label="Logs" accept=".log,.txt" upload={quick} uploadMode="manual" />\r
                <Button text="Send the logs" variant="outline" onclick={() => void manual.upload()} />\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,h=(e,t,n)=>new Promise((r,i)=>{let a=Math.max(600,Math.min(4e3,e.size/1e6*2e3))/20,o=0,s=setInterval(()=>{o++,t(o/20),o===20&&(clearInterval(s),r(`id-${e.name}`))},a);n.addEventListener(`abort`,()=>{clearInterval(s),i(Error(`stopped`))})});function g(){let e=n({files:[],told:``});return t(a,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(i,{label:`Attachments`,helpText:`Any files; a stand-in server takes them.`,upload:h,onUploaded:t=>e.told=`${t.file.name} is up as ${String(t.item.response)}.`,onUploadAborted:t=>e.told=`${t.file.name} was stopped.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.files,t=>{let n=e;n!=null&&typeof n.files!=`function`&&(n.files=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`fu-told`),t.bindings.method(()=>e.told||`${e.files.length} file(s) taken`)}},1)]})}function _(){let e=n({files:[],refused:``});return t(a,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(i,{label:`Documents`,accept:`.pdf,image/*`,maxFileSize:2e6,maxFiles:3,required:!0,onFilesAdded:t=>e.refused=t.refused.length?t.refused.map(e=>e.message).join(` `):``,runover:{initializeComponent:t=>{t.bindings.model(()=>e.files,t=>{let n=e;n!=null&&typeof n.files!=`function`&&(n.files=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`fu-refused`),t.bindings.method(()=>e.refused)}},1)]})}var v=(e,t)=>new Promise(e=>{let n=0,r=setInterval(()=>{t(++n/10),n===10&&(clearInterval(r),e())},120)});function y(){let e=n({one:[]}),o;return t(a,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(i,{label:`Photo`,multiple:!1,allowDrop:!1,accept:`image/*`,upload:v,uploadMode:`button`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.one,t=>{let n=e;n!=null&&typeof n.one!=`function`&&(n.one=t)})}},childs:[]}),t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Logs`,accept:`.log,.txt`,upload:v,uploadMode:`manual`,ref:e=>o=e,runover:{},childs:[]}),t(r,{text:`Send the logs`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void o.upload())}},childs:[]})]})]})}var b=d(Object.assign({"./examples/Basic.tsx":f,"./examples/Limits.tsx":p,"./examples/Modes.tsx":m})),x=[[`value`,"`Bind<readonly File[]>`","`[]`","The accepted files, excluding rejected ones. `x-model` provides two-way binding."],[`multiple`,"`Bind<boolean>`","`true`","Allows several files at once. `false` keeps only the most recent one."],[`accept`,"`Bind<string>`","`''`",'The accepted file types, as in `<input type="file">`: `.png,.jpg`, `image/*`, `application/pdf`.'],[`maxFileSize, minFileSize`,"`Bind<number | null>`","`null`",`Size limits in bytes. A file outside the limits is listed as rejected with the reason.`],[`maxFiles`,"`Bind<number | null>`","`null`",`The maximum number of files.`],[`allowDrop`,"`Bind<boolean>`","`true`",`Allows files to be dropped on the box.`],[`uploadMode`,"`Bind<UploadMode>`","`instant` / `manual`","`instant` uploads on selection, `button` adds an Upload button, and `manual` uses `upload()` programmatically. The default is `instant` with `uploadUrl` or `upload`, and `manual` otherwise."],[`uploadUrl, uploadMethod, uploadHeaders, uploadField`,"`Bind<string | null>`, …","`null`, `POST`, `null`, `file`","Where and how the uploader sends a file itself, using XMLHttpRequest with progress, as a form with the file in `uploadField`."],[`chunkSize`,"`Bind<number | null>`","`null`","Bytes per request. The file is sent in chunks, each with `Content-Range` and the `chunkIndex` and `chunkCount` fields, and the last response is used."],[`upload`,"`(file, report, signal) => Promise<unknown>`",`—`,"A custom upload function used instead of `uploadUrl`. Call `report(0…1)` to report progress and stop on `signal`. The value it resolves to becomes the response."],[`selectText, dropText, uploadText`,"`Bind<string>`",`Kit default`,`The button, the hint next to it and the Upload button.`],[`showFileList`,"`Bind<boolean>`","`true`",`The list of files below the box.`],[`label, helpText, required, rules, readOnly, size, variant…`,``,``,`Field props shared by all editors.`]],S=[[`items`,`read-only`,"Every file in the list with its state: `file`, `status` (`ready`, `uploading`, `done`, `error`, `aborted`, `invalid`), `progress`, `response` and `message`."],[`isUploading`,`read-only`,`Indicates that an upload is running.`],[`openDialog()`,"`void`",`Opens the browser's file dialog, the same as the button.`],[`addFiles(files)`,"`void`","Adds files as if the user selected them. The limits apply, `onFilesAdded` is raised, and uploads start according to the mode."],[`upload(item?)`,"`Promise<void>`","Uploads the waiting files, or one of them. This is what `manual` mode calls."],[`abort(item?), remove(item), clear()`,"`void`",`Stops an upload (the file remains, marked as canceled), removes a file, or removes all files.`],[`onFilesAdded`,`event`,"Occurs when files are selected or dropped (`files`, `refused`). Set `cancel = true` to accept none."],[`onFileRemoved, onUploadStarted, onProgress, onUploaded, onUploadError, onUploadAborted`,`event`,"Reports each stage of a file's upload, with `item` and `file`, and `error` on failure."],[`onValueChanged`,`event`,`Occurs when the accepted files change.`]],C=[[`Choosing`,`The button opens the file dialog. Files can also be dropped on the box, which is highlighted while they are over it.`],[`Refusing`,"A file that does not meet `accept`, the size limits or `maxFiles` is listed as rejected with the reason, and is not added to the value."],[`Uploading`,"Uploads start on selection, on the Upload button, or programmatically. Each row shows progress and a Cancel button during the upload, then “Uploaded” or the failure with Retry. The server response is available as the item's `response`, with JSON parsed."],[`Chunks`,"With `chunkSize`, the file is sent in chunks, each in a request with `Content-Range: bytes start-end/total`, and progress covers the whole file."],[`Removing chips`,`Each row has a remove button. A running upload is stopped first.`]],w=[[`Button`,`The select button is the field's control. The label is associated with it, and Space and Enter open the dialog.`],[`List`,`A list of rows with the name, size and status as text, a progress bar named after the file, and buttons named “Cancel the upload of …”, “Retry” and “Remove …”.`],[`Messages`,`Rejection reasons and failures use the kit language or the server's message.`]],T=[[`.mx-file-uploader`,"The field. `data-dragover` while files are over it."],[`.mx-file-uploader__select, .mx-file-uploader__drop, .mx-file-uploader__upload`,`The select button, the hint and the Upload button.`],[`.mx-file-uploader__list, .mx-file-uploader__item`,"The list and each row. `data-status` on the row."],[`.mx-file-uploader__icon, __name, __size, __state, __progress, __actions, __action`,`The parts of a row.`]],E=[[`file-uploader.over, .select, .upload, .hint, .list, .item, .icon, .name, .size, .state`,"Units: the box with files over it, the two buttons (`hover`, `pressed`, `focus`, `disabled`), the hint, the list, a row per status, the file glyph and the text."],[`file-uploader.field, .action`,`Places: the field box as a drop zone (a dashed frame, its corners and its padding) and the row buttons.`],[`file-uploader.box-gap, .button-gap, .item-gap`,`The spacing in the box, in a button and in a row.`]];function D(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(l,{text:`Lets users select files with a button or drop them on the box. Files are listed with their size and status, and can upload automatically, on a button click or programmatically, with progress, cancel, retry and remove for each file. Files that exceed the limits are listed with the reason.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(s,{anchor:`import`,title:`Import`,runover:{},childs:[t(o,{code:`
import { FileUploader } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(s,{anchor:`ways`,title:`Selecting, dropping and uploading`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`upload` is your own function for sending a file. Report progress, stop on the signal, and resolve to the response. Alternatively, with `uploadUrl`, the uploader sends the file itself, either in one request or in chunks (`chunkSize`).",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:b(`Basic.tsx`),runover:{},childs:[t(g,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(s,{anchor:`limits`,title:`Limits`,runover:{},childs:[t(c,{stack:!0,files:b(`Limits.tsx`),runover:{},childs:[t(_,{runover:{},childs:[]})]})]});e.controls.add(a);let d=t(s,{anchor:`modes`,title:`Upload modes`,runover:{},childs:[t(c,{stack:!0,files:b(`Modes.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(s,{anchor:`server`,title:`Uploading to a server`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"The uploader posts a form with the file in `uploadField` (`file` by default) to `uploadUrl`, using `uploadHeaders`. A 2xx response becomes the item's `response`, and JSON is parsed. With `chunkSize`, each chunk carries `Content-Range` and the `chunkIndex` and `chunkCount` fields.",runover:{},childs:[]});e.controls.add(n)}},1),t(o,{code:`
<FileUploader
  label="Attachments"
  uploadUrl="/api/files"
  uploadHeaders={{ Authorization: 'Bearer ' + token }}
  chunkSize={1_000_000}
  onUploaded={(e) => this.attachments.push(e.item.response as Attachment)}
/>
`,runover:{},childs:[]})]});e.controls.add(f);let p=t(s,{anchor:`behaviour`,title:`Behavior`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:C,runover:{},childs:[]})]});e.controls.add(p);let m=t(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:w,runover:{},childs:[]})]});e.controls.add(m);let h=t(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(u,{head:[`Hook`,`Description`],rows:T,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Token`,`Description`],rows:E,runover:{},childs:[]})]});e.controls.add(h);let v=t(s,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Prop`,`Type`,`Default`,`Description`],rows:x,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Member`,`Type`,`Description`],rows:S,runover:{},childs:[]})]});e.controls.add(v)}}})}export{D as default};