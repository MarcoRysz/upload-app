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
  const [kostenvoranschlagId, setKostenvoranschlagId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadUrls, setUploadUrls] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('kostenvoranschlag_id');
    if (id) {
      setKostenvoranschlagId(id);
    }
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    setSelectedFiles([...selectedFiles, ...imageFiles]);
  };

  const removeFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const handleUpload = async () => {
    if (!kostenvoranschlagId || selectedFiles.length === 0) {
      setUploadStatus("Keine Bilder oder ID gefunden.");
      return;
    }

    const uploadedUrls = [];

    for (const file of selectedFiles) {
      const filePath = `${kostenvoranschlagId}/${uuidv4()}.jpg`;

      const { data, error } = await supabase.storage
        .from('kostenvoranschlag')
        .upload(filePath, file);

      if (error) {
        setUploadStatus("Fehler beim Hochladen.");
        console.error(error);
        return;
      }

      const publicUrl = supabase.storage
        .from('kostenvoranschlag')
        .getPublicUrl(filePath).data.publicUrl;

      uploadedUrls.push(publicUrl);
    }

    setUploadUrls(uploadedUrls);
    setUploadStatus("Upload abgeschlossen!");
    setSelectedFiles([]); // Leeren nach Upload
  };

  return (
    <div className="container">
      <h2>Bild-Upload für Kostenvoranschlag</h2>
      {kostenvoranschlagId ? (
        <>
          <p><strong>ID:</strong> {kostenvoranschlagId}</p>

          <input type="file" accept="image/*" multiple onChange={handleFileChange} />

          {selectedFiles.length > 0 && (
            <>
              <p>Vorschau:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {selectedFiles.map((file, index) => (
                  <div key={index}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      width="150"
                      style={{ borderRadius: "8px" }}
                    />
                    <br />
                    <button onClick={() => removeFile(index)}>Entfernen</button>
                  </div>
                ))}
              </div>
              <button onClick={handleUpload}>Upload bestätigen</button>
            </>
          )}

          <p>{uploadStatus}</p>

          {uploadUrls.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p>Erfolgreich hochgeladene Bilder:</p>
              {uploadUrls.map((url, index) => (
                <img key={index} src={url} alt="Uploaded" width="150" />
              ))}
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
