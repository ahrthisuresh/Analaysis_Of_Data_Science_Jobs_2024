from data_preprocessing import load_and_preprocess_data, export_skill_data, export_location_data, export_industry_trends

def main():
    # Preprocess the data from the cleaned CSV
    df = load_and_preprocess_data('../data/dashboard_cleaned_data.csv')
    
    # Export the preprocessed data for the dashboards
    export_skill_data(df)
    export_location_data(df)
    export_industry_trends(df)
    print("Data exported successfully. D3.js dashboards are ready to use.")
    
if __name__ == "__main__":
    main()
