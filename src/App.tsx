import React, { useEffect, useState } from "react";

const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const APP_ID = import.meta.env.VITE_APP_ID;

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [pickerResponse, setPickerResponse] = useState<string>("");

  useEffect(() => {
    // Função para carregar gapi e inicializar o Picker
    const loadGapi = () => {
      window.gapi.load("client:picker", async () => {
        await window.gapi.client.load(
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
        );
        setPickerInited(true);
      });
    };

    // Função para carregar Google Identity Services
    const loadGis = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: "", // Será definido ao clicar em "Authorize"
      });
      setTokenClient(client);
      setGisInited(true);
    };

    // Adicionar scripts dinamicamente
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = loadGapi;
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = loadGis;
    document.body.appendChild(gisScript);
  }, []);

  const handleAuthClick = () => {
    if (!tokenClient) return;

    tokenClient.callback = async (response: any) => {
      if (response.error) {
        console.error("Authorization error:", response.error);
        return;
      }
      setAccessToken(response.access_token);
      localStorage.setItem("pingallery_token", response.access_token);
    };

    if (!accessToken) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  };

  const handleSignoutClick = () => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken);
      setAccessToken(null);
      setPickerResponse("");
    }
  };

  const createPicker = () => {
    if (!accessToken || !pickerInited) return;

    const view = new window.google.picker.View(
      window.google.picker.ViewId.DOCS
    );
    view.setMimeTypes("image/png,image/jpeg,image/jpg");

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setDeveloperKey(API_KEY)
      .setAppId(APP_ID)
      .setOAuthToken(accessToken)
      .addView(view)
      .addView(new window.google.picker.DocsUploadView())
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);
  };

  const pickerCallback = async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const document = data[window.google.picker.Response.DOCUMENTS][0];
      const fileId = document[window.google.picker.Document.ID];

      const res = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: "*",
      });

      setPickerResponse(JSON.stringify(res.result, null, 2));
    }
  };

  return (
    <div>
      <h1>Picker API Quickstart</h1>
      {!pickerInited || !gisInited ? (
        <p>Loading...</p>
      ) : (
        <>
          <button onClick={handleAuthClick}>Authorize</button>
          <button onClick={handleSignoutClick}>Sign Out</button>
          <button onClick={createPicker} disabled={!accessToken}>
            Open Picker
          </button>
          <pre style={{ whiteSpace: "pre-wrap" }}>{pickerResponse}</pre>
        </>
      )}
    </div>
  );
};

export default App;
