import tensorflow as tf
import numpy as np
import cv2
import os

model = tf.keras.models.load_model("model.keras")

classes = ['Eczema', 'Warts Molluscum and other Viral Infections', 'Atopic Dermatitis', 
           'Basal Cell Carcinoma (BCC)', 'Benign Keratosis-like Lesions (BKL)',
           'Psoriasis / Lichen Planus and related diseases', 
           'Seborrheic Keratoses and other Benign Tumors',
           'Tinea / Ringworm / Candidiasis and other Fungal Infections']

def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return None
    img = cv2.resize(img, (224, 224))
    img = img / 255.0
    return np.expand_dims(img, axis=0)

for file in os.listdir('.'):
    if file.lower().endswith(('.jpg', '.jpeg')):
        image = preprocess_image(file)
        if image is not None:
            predictions = model.predict(image, verbose=0)
            predicted_class = np.argmax(predictions)
            confidence = predictions[0][predicted_class]
            print(f"\nImage: {file}")
            print(f"Prediction: {classes[predicted_class]}")
            print(f"Confidence: {confidence:.2f}") 