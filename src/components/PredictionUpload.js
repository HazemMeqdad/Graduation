import React, { useState } from 'react';
import styles from '../styles/PredictionUpload.module.css';

const PredictionUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setPredictions(null);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get prediction');
            }

            setPredictions(data.predictions);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadSection}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                />
                {preview && (
                    <div className={styles.previewContainer}>
                        <img src={preview} alt="Preview" className={styles.preview} />
                    </div>
                )}
                <button 
                    onClick={handleSubmit} 
                    disabled={!selectedFile || loading}
                    className={styles.submitButton}
                >
                    {loading ? 'Analyzing...' : 'Analyze Image'}
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {predictions && (
                <div className={styles.results}>
                    <h2>Prediction Results</h2>
                    {predictions.map((pred, index) => (
                        <div key={index} className={styles.predictionItem}>
                            <div className={styles.diseaseLabel}>
                                {pred.disease}
                            </div>
                            <div className={styles.probabilityBar}>
                                <div 
                                    className={styles.probabilityFill}
                                    style={{ width: `${pred.probability * 100}%` }}
                                />
                                <span className={styles.probabilityText}>
                                    {(pred.probability * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PredictionUpload; 