import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

// Supabase-Client initialisieren
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_ANON_KEY
);

function App() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [kostenvoranschlagId, setKostenvoranschlagId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('kostenvoranschlag_id');
    if (id) {
      setKostenvoranschlagId(id);
    }
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !kostenvoranschlagId) {
      setUploadStatus('Fehlende Datei oder ID.');
      return;
    }

    const filePath = `${kostenvoranschlagId}/${uuidv4()}.jpg`;

    const { data, error } = await supabase
      .storage
      .from('kostenvoranschlag')
      .upload(filePath, file);

    if (error) {
      console.error(error);
      setUploadStatus('Fehler beim Hochladen.');
    } else {
      setUploadStatus('Upload erfolgreich!');
      const publicUrl = supabase
        .storage
        .from('kostenvoranschlag')
        .getPublicUrl(filePath).data.publicUrl;
      setUploadUrl(publicUrl);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Kostenvoranschlag Bild-Upload</h2>
      {kostenvoranschlagId ? (
        <>
          <p><strong>ID:</strong> {kostenvoranschlagId}</p>
          <input type="file" onChange={uploadImage} />
          <p>{uploadStatus}</p>
          {uploadUrl && (
            <div style={{ marginTop: '20px' }}>
              <p>Bildvorschau:</p>
              <img src={uploadUrl} alt="Upload Preview" width="300" />
            </div>
          )}
        </>
      ) : (
        <p>Keine Kostenvoranschlag-ID in der URL gefunden.</p>
      )}
    </div>
  );
}

export default App;
