import React, { useState, useCallback } from 'react';
import '../styles/App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFiles = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(URL.createObjectURL(file));
      setUploadStatus(null);
    }
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      handleFiles(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      const fileInput = document.querySelector('input[type="file"]');
      formData.append('file', fileInput.files[0]);

      const response = await fetch('http://158.220.104.116:7894/predict', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.error) {
        setUploadStatus({ error: result.error });
      } else {
        // Get the top prediction (first item in the sorted predictions array)
        const topPrediction = result.predictions[0];
        
        // Convert predictions array to object for probability bars
        const probabilitiesObject = result.predictions.reduce((acc, pred) => {
          acc[pred.disease] = pred.probability;
          return acc;
        }, {});

        setUploadStatus({
          predicted_class: topPrediction.disease,
          confidence: topPrediction.probability,
          all_probabilities: probabilitiesObject,
          message: 'Analysis completed successfully!'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus({ error: 'Failed to process image' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>SmartSkin</h1>
      <p className="subtitle">Advanced Skin Condition Analysis</p>
      
      <div 
        className={`upload-section ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
          id="file-input"
        />
        {!selectedImage ? (
          <label htmlFor="file-input" className="file-input-label">
            <div className="upload-icon">📸</div>
            <div className="upload-text">
              Click to upload or drag and drop
              <span className="upload-hint">Supported formats: JPG, PNG</span>
            </div>
          </label>
        ) : (
          <div className="preview-section">
            <img src={selectedImage} alt="Preview" className="image-preview" />
            <div className="button-group">
              <label htmlFor="file-input" className="change-image-btn">
                Choose Different Image
              </label>
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="analyze-button"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Analyzing...
                  </>
                ) : 'Analyze Image'}
              </button>
            </div>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className="status-section">
          <h2>Analysis Results</h2>
          {uploadStatus.error ? (
            <div className="error-container">
              <span className="error-icon">⚠️</span>
              <p className="error">{uploadStatus.error}</p>
            </div>
          ) : (
            <div className="results">
              <div className="success-message">
                <span className="success-icon">✓</span>
                <p className="success">{uploadStatus.message}</p>
              </div>
              
              <div className="prediction-container">
                <div className="prediction-card">
                  <h3>Predicted Condition</h3>
                  <p className="prediction-value">{uploadStatus.predicted_class}</p>
                </div>
                <div className="prediction-card">
                  <h3>Confidence Level</h3>
                  <p className="prediction-value">
                    {(uploadStatus.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              {uploadStatus.all_probabilities && (
                <div className="all-probabilities">
                  <h3>Detailed Analysis</h3>
                  {Object.entries(uploadStatus.all_probabilities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([className, probability]) => (
                      <div key={className} className="probability-bar">
                        <div className="probability-label">
                          {className}
                        </div>
                        <div className="probability-value">
                          <div 
                            className="probability-fill"
                            style={{ width: `${probability * 100}%` }}
                          />
                          <span>{(probability * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 