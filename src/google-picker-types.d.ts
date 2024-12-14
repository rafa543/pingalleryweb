export {};

declare global {
  interface PickerResponse {
    action: string;
    docs: PickerDoc[];
  }

  interface PickerDoc {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink: string;
    url: string;
  }

  interface GapiPicker {
    PickerBuilder: {
      new (): PickerBuilder;
    };
    ViewId: {
      PHOTOS: string;
    };
    Action: {
      PICKED: string;
      CANCEL: string;
    };
  }

  interface PickerBuilder {
    addView(view: any): this;
    setOAuthToken(token: string): this;
    setDeveloperKey(key: string): this;
    setCallback(callback: (data: PickerResponse) => void): this;
    build(): Picker;
  }

  interface Picker {
    setVisible(visible: boolean): void;
  }

  interface Gapi {
    picker: GapiPicker;
    load(api: string, callback: () => void): void;
    auth2: {
      getAuthInstance(): {
        currentUser: {
          get(): {
            getAuthResponse(): {
              access_token: string;
            };
          };
        };
      };
    };
    client: {
      init(config: {
        apiKey: string;
        clientId: string;
        scope: string;
      }): Promise<void>;
    };
  }

  interface Window {
    google: any; // Ou use um tipo mais específico se souber o formato
    gapi: any; // Se você estiver utilizando o gapi também
  }
}
