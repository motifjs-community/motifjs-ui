var e={name:`slow-adapter.ts`,source:`import { data } from '@motifx-community/data';\r
\r
/** Rows in memory that answer a little later, the way a server does; for the examples. */\r
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {\r
  constructor(\r
    options: data.ArrayAdapterOptions<T>,\r
    private readonly delayMs = 300,\r
  ) {\r
    super(options);\r
  }\r
\r
  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {\r
    await new Promise((done) => setTimeout(done, this.delayMs));\r
    return super.load(options);\r
  }\r
}\r
`};export{e as t};