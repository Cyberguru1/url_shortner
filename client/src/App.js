import './App.css';
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  // const [shortenedUrl, setShortenedUrl] = useState('');
  const [currentShortUrl, setCurrentShortUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: originalUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        var shortUrl = `${API_BASE_URL}/${data.slug}`
        // setShortenedUrl(shortUrl);
        setCurrentShortUrl(shortUrl);
        document.querySelector('#cButton').innerText = 'Copy Link';
      } else {
        console.error('Failed to shorten URL');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleGetShortenedUrl = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);

      if (response.ok) {
        const data = await response.json();
        const output = data.Current_Url ? data.Current_Url : data.message;
        setCurrentShortUrl(output);
      } else {
        setCurrentShortUrl('Failed to fetch current shortened URL');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleCopy = async () => {
    try {
      // Copy the text inside the text field
      navigator.clipboard.writeText(currentShortUrl);
      document.querySelector('#cButton').innerText = 'Copied!';
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div className="App">
      <h1>URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Original URL:
          <input type="url" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} required />
        </label>
        <button type="submit">Shorten URL</button>
      </form>

      {currentShortUrl && (
        <>
          <p>Shortened URL:
            <a href={currentShortUrl} target="_blank"  rel='noreferrer'> {currentShortUrl}</a>
          </p>
          <button onClick={handleCopy} id='cButton'>Copy Link</button>
        </>
      )}

      <div>
        <button onClick={handleGetShortenedUrl}>Get Current Shortened URL</button>
      </div>
    </div>
  );
}

export default App;
