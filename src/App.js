import React, { useEffect, useState } from "react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

// Supabase-Client initialisieren
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_ANON_KEY
);

function App() {
  const [userId, setUserId] = useState('');
  const [media, setMedia] = useState([]);

  // ✅ User aus Supabase holen
  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUserId(user?.id || '');
    } catch (error) {
      console.error('Fehler beim Abrufen des Nutzers:', error.message);
    }
  };

  // ✅ Bild in Supabase hochladen
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `${userId}/${uuidv4()}.jpg`;
    const { data, error } = await supabase
      .storage
      .from('kostenvoranschlag')
      .upload(filePath, file);

    if (error) {
      console.error('Upload-Fehler:', error.message);
    } else {
      console.log('Upload erfolgreich:', data);
      getMedia();
    }
  };

  // ✅ Liste der hochgeladenen Bilder holen
  const getMedia = async () => {
    if (!userId) return;

    const { data, error } = await supabase.storage
      .from('kostenvoranschlag')
      .list(`${userId}/`, {
        limit: 10,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('Fehler beim Laden der Dateien:', error.message);
    } else {
      setMedia(data);
    }
  };

  // ✅ Ausloggen
  const signout = async () => {
    await supabase.auth.signOut();
    setUserId('');
    setMedia([]);
  };

  // ✅ Lade Daten bei Änderung der UserID
  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (userId) getMedia();
  }, [userId]);

  // ✅ Render
  return (
    <div className='mt-5'>
      {userId === '' ? (
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      ) : (
        <>
          <input type="file" onChange={uploadImage} />
          <div className='mt-5'>Meine Uploads:</div>
          {media.length === 0 && <p>Du hast noch keine Bilder hochgeladen.</p>}
          {media.map((item) => (
            <div key={item.name}>
              <img
                src={`https://vrrmantgmjnkwajxxysd.supabase.co/storage/v1/object/public/kostenvoranschlag/${userId}/${item.name}`}
                alt="Upload"
                width="300"
              />
            </div>
          ))}
          <div className='mt-5'>
            <button onClick={signout}>Logout</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
