import { Ref } from 'vue';

declare global {
  interface JsonItem {
    id: string;
    key: string | number;
    value: any;
    catchValue?: {
      type: string;
      value: any;
    };
    type: string;
    root?: boolean;
  }
  // type EventTrigger = (name: string, value: any) => void;

  interface ExtendCatchKeyItem {
    key: string | number;
    level: number;
  }

  interface JsonEditorContext {
    extendCatchKey: Ref<ExtendCatchKeyItem[]>;
    disabled: Ref<boolean>;
    extendAll: Ref<boolean>;
    extendLevel: Ref<number>;
    jsonConfig: Ref<JsonEditorConfig>;
  }
  interface JsonEditorConfig {
    keyColor: {
      // [key: string]: string;
      string?: string;
      object?: string;
      array?: string;
      number?: string;
      boolean?: string;
      function?: string;
      date?: string;
      regExp?: string;
      undefined?: string;
      null?: string;
    };
    addType: boolean;
  }
}
