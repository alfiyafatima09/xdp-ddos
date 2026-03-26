import pandas as pd
import numpy as np
from xgboost import XGBClassifier
import joblib

def train_minimalist_model(data_path):
    # The exact names currently in your CSV (including the leading space)
    raw_cols = [' Flow Packets/s', 'Flow Bytes/s', ' Label']
    
    print(f"Loading dataset from: {data_path}...")
    
    # Load only the columns we need
    df = pd.read_csv(data_path, usecols=raw_cols)
    
    # --- RENAME STEP: Standardize names immediately ---
    df = df.rename(columns={
        ' Flow Packets/s': 'PPS',
        'Flow Bytes/s': 'BPS',
        ' Label': 'Label'
    })
    #flow packets--pps; flow bytes--bps; label--label
    
    
    print("Preprocessing and cleaning...")
    # Convert Labels: 0 for Benign, 1 for Attack
    df['Label'] = df['Label'].apply(lambda x: 0 if 'BENIGN' in str(x).upper() else 1)
    
    # Remove Infinity and NaN values
    df = df.replace([np.inf, -np.inf], np.nan).dropna()
    
    # Define Features (X) and Target (y) using the NEW names
    X = df[['PPS', 'BPS']]
    y = df['Label']
    
    # Train
    print("Training XGBoost with standardized features (PPS, BPS)...")
    model = XGBClassifier(
        n_estimators=100, 
        max_depth=4, 
        learning_rate=0.1,
        tree_method='hist' # Speeds up training on large CSVs
    )
    model.fit(X, y)
    
    # Save the model
    joblib.dump(model, 'minimalist_ddos_model.joblib')
    print("Model saved successfully as minimalist_ddos_model.joblib")

# Path to your DNS dataset
csv_path = r"/home/akshata-yangunde/Desktop/ddos-model/xdp-ddos/data/DrDoS_DNS.csv"
train_minimalist_model(csv_path)
