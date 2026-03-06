"""import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import plot_importance
import matplotlib.pyplot as plt
import numpy as np

# 1. Path to your data and model
csv_path = "C:/Users/megal/Desktop/projec/xdp/xdp-ddos/data/DNS.csv"
model_path = "C:/Users/megal/Desktop/projec/xdp/xdp-ddos/minimalist_ddos_model.joblib"

print("Loading model and data for testing...")
model = joblib.load(model_path)

# 2. Load a sample of the data to test (loading 100k rows for speed)
# Use the exact same columns used in training
cols = [' Flow Packets/s', 'Flow Bytes/s', ' Label']
df = pd.read_csv(csv_path, usecols=cols, nrows=100000)

# 3. Clean the data (Must match training logic exactly!)
df.columns = df.columns.str.strip()
df['Label'] = df['Label'].apply(lambda x: 0 if 'BENIGN' in str(x).upper() else 1)
df = df.replace([np.inf, -np.inf], np.nan).dropna()

X = df[['Flow Packets/s', 'Flow Bytes/s']]
y = df['Label']

# 4. Split and Evaluate
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
y_pred = model.predict(X_test)

print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred))

print("--- Confusion Matrix ---")
print(confusion_matrix(y_test, y_pred))

# 5. Visual Verification
plot_importance(model)
plt.title("Feature Importance: PPS vs BPS")
plt.show()"""

import joblib
import pandas as pd
import numpy as np

# 1. Load the model
model_path = "minimalist_ddos_model.joblib"
try:
    model = joblib.load(model_path)
    print(f"[*] Successfully loaded: {model_path}")
    print(f"[*] Expected features: {model.feature_names_in_}")
except:
    print("[!] Error: Model file not found. Run train_model.py first.")
    exit()

# 2. Define Test Scenarios
# Scenario A: Low traffic (Normal)
# Scenario B: High traffic (DDoS attack)
test_data = [
    {"PPS": 10.848104, "BPS": 0.471054845, "Description": "Nx"},
    {"PPS": 0.471054845, "BPS": 625173.1659, "Description": "x"},
]
"""
 flow packets(pps) flow bytes(bps)     label
1. 0.46905265	 12.48401669	BENIGN
2. 0.471054845	1.735465218	    BENIGN
3. 1420.848104	625173.1659	   DrDoS_DNS



"""

print("\n--- Running Model Verification ---")

for scenario in test_data:
    # Create a single-row DataFrame with our new names
    input_df = pd.DataFrame([[scenario["PPS"], scenario["BPS"]]], 
                            columns=['PPS', 'BPS'])
    
    # Get prediction (0 = Benign, 1 = Attack)
    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0] # Confidence level
    
    verdict = "!! ATTACK !!" if prediction == 1 else "NORMAL"
    confidence = probability[prediction] * 100
    
    print(f"Scenario: {scenario['Description']}")
    print(f"  Inputs: {scenario['PPS']} PPS, {scenario['BPS']} BPS")
    print(f"  Verdict: {verdict} (Confidence: {confidence:.2f}%)")
    print("-" * 40)
