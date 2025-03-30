from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Load the model
model = tf.keras.models.load_model("model.keras")

# Define the classes
classes = [
    'Eczema',
    'Warts Molluscum and other Viral Infections',
    'Atopic Dermatitis',
    'Basal Cell Carcinoma (BCC)',
    'Benign Keratosis-like Lesions (BKL)',
    'Psoriasis / Lichen Planus and related diseases',
    'Seborrheic Keratoses and other Benign Tumors',
    'Tinea / Ringworm / Candidiasis and other Fungal Infections'
]

def preprocess_image(image_path, img_size=224):
    img = cv2.imread(image_path)
    if img is None:
        return None
    img = cv2.resize(img, (img_size, img_size))
    img = img / 255.0
    return np.expand_dims(img, axis=0)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Save the uploaded file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(temp_path)

        # Preprocess the image
        image = preprocess_image(temp_path)
        if image is None:
            return jsonify({'error': 'Invalid image file'}), 400

        # Make prediction
        predictions = model.predict(image, verbose=0)
        
        # Get top predictions with probabilities
        results = []
        for i in range(len(classes)):
            results.append({
                'disease': classes[i],
                'probability': float(predictions[0][i])
            })
        
        # Sort by probability
        results.sort(key=lambda x: x['probability'], reverse=True)

        # Clean up
        os.remove(temp_path)

        return jsonify({'predictions': results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=7894)
