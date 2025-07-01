import os
import pandas as pd

# Set the folder path and columns to keep
folder_path = "./historical_intraday_csvs"
columns_to_keep = ['date', 'open', 'high', 'low', 'close', 'volume']  # Replace with your actual column names

# Output folder for new CSVs
output_folder = "./filtered_csvs"
os.makedirs(output_folder, exist_ok=True)

# Loop through all CSV files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".csv"):
        file_path = os.path.join(folder_path, filename)
        df = pd.read_csv(file_path)

        # Keep only the selected columns (ignore missing ones if any)
        df_filtered = df[[col for col in columns_to_keep if col in df.columns]]

        # Save to new CSV
        new_filename = f"filtered_{filename}"
        df_filtered.to_csv(os.path.join(output_folder, new_filename), index=False)

        print(f"Processed: {filename} -> {new_filename}")

